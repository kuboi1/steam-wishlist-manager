<script lang="ts">
    import { goto } from "$app/navigation";
    import { bulkRemoveLocalStorageItems, getLocalStorageItem, LS_KEY_GAME_CATEGORIES, LS_KEY_GAME_GENRES, LS_KEY_LAST_FETCH, LS_KEY_USER, LS_KEY_WISHLIST, LS_KEY_WISHLIST_CURRENT_PAGE, setLocalStorageItem } from "$lib/localstorage";
    import type { SteamUser, SteamWishlist } from "$lib/steamapi";
    import { formatDate } from "$lib/utils";
    import axios from "axios";
    import { onMount } from "svelte";

    interface Props {
        wishlist: SteamWishlist|null,
        refreshGameIds: Set<string>
    }

    let { wishlist, refreshGameIds }: Props = $props();

    let user = $state<SteamUser|undefined>();
    let currentWishlistPage = $state(0);

    let lastFetch = $state<number|null>(null);

    let isProcessing = $state(false);
    let statusMessage = $state<string|null>(null);
    let estimatedMinutesRemaining = $state<number|null>(null);
    let secTillNextRequest = $state<number|null>(null);
    let fetchComplete = $state(false);
    let loadingDots = $state('.');

    let clearConfirm = $state(false);

    onMount(async () => {
        const savedUser = await getLocalStorageItem(LS_KEY_USER);

        if (!savedUser) goto('/');

        user = savedUser as SteamUser;
        lastFetch = (await getLocalStorageItem(LS_KEY_LAST_FETCH)) as number|null;
    });

    const handleFetch = async () => {
        const ITEMS_PER_PAGE = 180;
        const WAIT_TIME_MS = 300000; // 5 minutes
        const NEED_WAIT_THRESHOLD_MS = 5000; // 5 seconds

        const needsWait = (timeStart: number) => (Date.now() - timeStart > NEED_WAIT_THRESHOLD_MS);

        isProcessing = true;
        fetchComplete = false;

        const loadingDotsInterval = setInterval(
            () => loadingDots = (loadingDots.length === 4) ? '.' : (loadingDots + '.'),
            500
        );

        let excludeIds: string[] = [];
        if (wishlist) {
            excludeIds = wishlist.items.map((item) => item.game.id);
            excludeIds = excludeIds.filter((id) => !refreshGameIds.has(id));
        }

        if (!wishlist) {
            statusMessage = 'Fetching your wishlisted games';

            const timeStart = Date.now();
            wishlist = await fetchWishlistPage(currentWishlistPage, ITEMS_PER_PAGE);
            setLocalStorageItem(LS_KEY_WISHLIST, wishlist);
            currentWishlistPage++;

            if (needsWait(timeStart) && (currentWishlistPage < wishlist.pageCount)) {
                await waitForNextRequest(WAIT_TIME_MS);
            }
        }

        while (currentWishlistPage <= wishlist.pageCount) {
            const timeStart = Date.now();

            statusMessage = `Fetching your wishlisted games (${currentWishlistPage + 1}/${wishlist.pageCount + 1})`;

            const wishlistPage = await fetchWishlistPage(currentWishlistPage, ITEMS_PER_PAGE, excludeIds);

            if (wishlist) wishlist.items = [...wishlist.items, ...wishlistPage.items];

            setLocalStorageItem(LS_KEY_WISHLIST, wishlist);

            currentWishlistPage++;

            if (needsWait(timeStart) && currentWishlistPage < wishlist.pageCount) await waitForNextRequest(WAIT_TIME_MS);
        }
        
        estimatedMinutesRemaining = null;
        statusMessage = 'Cleaning up';

        bulkRemoveLocalStorageItems([
            LS_KEY_GAME_CATEGORIES,
            LS_KEY_GAME_GENRES
        ]);
        refreshGameIds = new Set();

        lastFetch = new Date().getTime();
        setLocalStorageItem(LS_KEY_LAST_FETCH, lastFetch);

        clearInterval(loadingDotsInterval);

        isProcessing = false;
        loadingDots = '.';

        statusMessage = 'Wishlist fetch complete!';
        fetchComplete = true;
        currentWishlistPage = 0;
    }

    const handleClearWishlist = () => {
        if (!clearConfirm) {
            clearConfirm = true;
            return;
        }
        
        bulkRemoveLocalStorageItems([
            LS_KEY_WISHLIST,
            LS_KEY_GAME_CATEGORIES,
            LS_KEY_GAME_GENRES
        ]);
        
        clearConfirm = false;
        wishlist = null;
        refreshGameIds.clear();

        statusMessage = 'Wishlist cleared!'
    }

    const fetchWishlistPage = async (page: number, perPage: number, excludeIds: string[] = []) => {
        const response = await axios.get('/api/steam/wishlist', {
            params: { 
                steamid: user?.id, 
                page, 
                perPage,
                excludeids: excludeIds.join(',')
            }
        });

        return response.data as SteamWishlist;
    } 

    const waitForNextRequest = async (waitTimeMs: number) => {
        secTillNextRequest = waitTimeMs/1000;
        const waitStatusInterval = setInterval(() => {
            statusMessage = `Waiting to make more requests ${secTillNextRequest}s`; 
            if (wishlist) {
                estimatedMinutesRemaining = ((wishlist.pageCount - (currentWishlistPage + 1)) * (waitTimeMs + 60000)) / 60000;
            }
            if (secTillNextRequest) secTillNextRequest--;
        }, 1000)
        await sleep(waitTimeMs);
        clearInterval(waitStatusInterval);
        secTillNextRequest = null;
    }

    const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)); 
</script>

<div>
    <div class="w-full text-center mb-2 pb-2 border-b border-gray-600 space-y-1">
        <h2 class="text-2xl">
            Wishlist Fetcher
        </h2>
        <div class="text-xs">
            {lastFetch ? `Last Fetch: ${formatDate(new Date(lastFetch))}` : 'Make your first fetch to get started'}
        </div>
    </div>
    <div class="text-sm text-center space-y-2 pb-2 border-b border-gray-600">
        <div class="text-base">
            <p>This is the place where you can fetch your steam wishlist and save it into memory!</p>
            <p>It will take a while if you have 200+ games in the wishlist so just be patient.</p>
        </div>
        <div>
            <p>Only games that are not loaded yet will be fetched.</p>
            <p>If you want to re-fetch games that are already loaded, you need to select them in the '<i>Loaded&nbsp;Games</i>' tab.</p>
            <p>There are currently <strong>{refreshGameIds.size}</strong> game/s selected for re-fetch.</p>
        </div>
    </div>
    <div class="w-full flex flex-col justify-center items-center p-2">
        {#if isProcessing}
            <div class="text-center pt-6">
                <p
                    class="
                        animate-text-gradient bg-clip-text bg-[length:300%] text-xl
                        bg-gradient-to-r from-sky-900 via-sky-500 to-sky-50 text-transparent
                    "
                >
                    Fetching Wishlist
                </p>
                <p class="text-xs">This might take a while, go outside and touch some grass.</p>
                <p>{loadingDots}</p>
                <p class="text-xs">{statusMessage}</p>
                {#if estimatedMinutesRemaining}
                    <p>Est. time remaining: {estimatedMinutesRemaining}m</p>
                {/if}
            </div>
        {:else}
            <p class="text-center text-sm pt-6">
                Click Fetch&nbsp;Wishlist to initiate fetching or Clear&nbsp;Wishlist to remove current loaded wishlist from memory.
            </p>
            <div class="flex gap-4 pt-5">
                <button
                    class="px-3 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                    onclick={handleFetch}
                >
                    Fetch Wishlist
                </button>
                <button
                    class="px-3 py-2 bg-red-500 hover:bg-red-400 rounded-lg transition-colors"
                    onclick={handleClearWishlist}
                >
                    {clearConfirm ? 'Are you sure?' : 'Clear Wishlist'}
                </button>
            </div>
            <div class="flex flex-col gap-1 items-center w-full text-center pt-2">
                <p class="text-sm">{statusMessage}</p>
                {#if fetchComplete}
                    <a
                        class="w-fit text-xs px-2 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 transition-colors"
                        href="/wishlist"
                    >
                        Go To Wishlist
                    </a>
                {/if}
            </div>
        {/if}
    </div>
</div>