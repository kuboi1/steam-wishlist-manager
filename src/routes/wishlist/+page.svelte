<script lang="ts">
    import { type SteamWishlist } from "$lib/steamapi";
    import { onMount } from "svelte";
    import axios from "axios";
    import WishlistCollection, { type FilterOptions } from "$lib/components/WishlistCollection.svelte";
    import { bulkRemoveLocalStorageItems, getLocalStorageItem, LS_KEY_GAME_CATEGORIES, LS_KEY_GAME_GENRES, LS_KEY_WISHLIST, LS_KEY_WISHLIST_CURRENT_PAGE, setLocalStorageItem } from "$lib/localstorage";
    import InifiniteScrollContainer from "$lib/components/InifiniteScrollContainer.svelte";
    import { goto } from "$app/navigation";

    let wishlist = $state<SteamWishlist>();
    let gameCategories = $state<FilterOptions>({});
    let gameGenres = $state<FilterOptions>({});
    let currentPage = $state(0);
    
    let loadingWishlist = $state(true);
    
    let bgHighlight = $state<string|null>(null);

    onMount(async () => {
        currentPage = await (getLocalStorageItem(LS_KEY_WISHLIST_CURRENT_PAGE) ?? 0) as number;

        await loadWishlist();
    });

    const loadWishlist = async () => {
        bgHighlight = null;
        loadingWishlist = true;

        const savedWishlist = await getLocalStorageItem(LS_KEY_WISHLIST);

        if (!savedWishlist) await goto('/wishlist/fetch');

        if (savedWishlist) {
            wishlist = savedWishlist as SteamWishlist;
        } else {
            wishlist = await fetchWishlist();
            setLocalStorageItem(LS_KEY_WISHLIST, wishlist);
            bulkRemoveLocalStorageItems([
                LS_KEY_GAME_CATEGORIES,
                LS_KEY_GAME_GENRES
            ]);
        }

        loadGameCategories();
        loadGameGenres();

        loadingWishlist = false;
    }

    const loadGameCategories = async () => {
        gameCategories = await getLocalStorageItem(LS_KEY_GAME_CATEGORIES, getAvailableGameCategories) as FilterOptions;
    }

    const loadGameGenres = async () => {
        gameGenres = await getLocalStorageItem(LS_KEY_GAME_GENRES, getAvailableGameGenres) as FilterOptions;
    }

    const fetchWishlist = async (page = 0) => {
        const response = await axios.get('/api/steam/wishlist', {
            params: { steamid: 0, page }
        });
        return response.data as SteamWishlist;
    }

    const getAvailableGameCategories = async () => {
        const categories: FilterOptions = {};
        wishlist?.items.forEach((item) => {
            item.game.categories.forEach((category) => {
                categories[category.id] = category.description;
            });
        });
        return categories;
    }

    const getAvailableGameGenres = async () => {
        const genres: FilterOptions = {};
        wishlist?.items.forEach((item) => {
            item.game.genres.forEach((genre) => {
                genres[genre.id] = genre.description;
            });
        });
        return genres;
    }
</script>

<div
    class="flex flex-1 bg-center bg-repeat-y bg-[size:100%] transition-all ease-out duration-500"
    style={`background-image: url(${bgHighlight})`}
>
    {#if loadingWishlist}
        <div 
            class="
                flex-1 flex justify-center items-center
                animate-text-gradient bg-clip-text bg-[length:300%] text-xl md:text-3xl 
                bg-gradient-to-r from-sky-900 via-sky-500 to-sky-50 text-transparent
            "
        >
            Loading Your Wishlist
        </div>
    {:else}
        <InifiniteScrollContainer
            onreachend={async () => {}}
            loadMoreCondition={true}
        >
            <WishlistCollection 
                wishlist={wishlist} 
                filterCategories={gameCategories}
                filterGenres={gameGenres}
                bind:bgHighlight={bgHighlight} 
            />
        </InifiniteScrollContainer>
    {/if}
</div>

