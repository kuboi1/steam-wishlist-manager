<script lang="ts">
    import { type SteamWishlist } from "$lib/steamapi";
    import { onMount } from "svelte";
    import WishlistCollection from "$lib/components/WishlistCollection.svelte";
    import { bulkRemoveLocalStorageItems, getLocalStorageItem, LS_KEY_GAME_CATEGORIES, LS_KEY_GAME_GENRES, LS_KEY_WISHLIST, LS_KEY_WISHLIST_CURRENT_PAGE, setLocalStorageItem } from "$lib/localstorage";
    import InifiniteScrollContainer from "$lib/components/InifiniteScrollContainer.svelte";
    import { goto } from "$app/navigation";
    import type { FilterOptions } from "$lib/components/WishlistFilter.svelte";
    import libraryBgImage from "$lib/image/library_bg.webp";

    let wishlist = $state<SteamWishlist>();
    let gameCategories = $state<FilterOptions>({});
    let gameGenres = $state<FilterOptions>({});
    let currentPage = $state(0);
    
    let loadingWishlist = $state(true);
    
    let bgHighlight = $state<string>(libraryBgImage);

    onMount(async () => {
        currentPage = await (getLocalStorageItem(LS_KEY_WISHLIST_CURRENT_PAGE) ?? 0) as number;

        await loadWishlist();
    });

    const loadWishlist = async () => {
        bgHighlight = libraryBgImage;
        loadingWishlist = true;

        const savedWishlist = await getLocalStorageItem(LS_KEY_WISHLIST);

        if (!savedWishlist) goto('/wishlist/fetch');

        wishlist = savedWishlist as SteamWishlist;

        bulkRemoveLocalStorageItems([
            LS_KEY_GAME_CATEGORIES,
            LS_KEY_GAME_GENRES
        ])

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

    const getAvailableGameCategories = async () => {
        const categories: FilterOptions = {};
        wishlist?.items.forEach((item) => {
            if (!item.game.categories) return;
            item.game.categories.forEach((category) => {
                categories[category.id] = category.description;
            });
        });
        return categories;
    }

    const getAvailableGameGenres = async () => {
        const genres: FilterOptions = {};
        wishlist?.items.forEach((item) => {
            if (!item.game.genres) return;
            item.game.genres.forEach((genre) => {
                genres[genre.id] = genre.description;
            });
        });
        return genres;
    }
</script>

<div
    class="flex flex-1 bg-center bg-repeat-y bg-[length:100%]"
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

