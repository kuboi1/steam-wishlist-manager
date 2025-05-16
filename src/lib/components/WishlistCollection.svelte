<script lang="ts">
    import type { SteamGame, SteamWishlist, SteamWishlistItem } from "$lib/steamapi";
    import WishlistItem from "./WishlistItem.svelte";
    import WishlistFilter, { type FilterOptions } from "./WishlistFilter.svelte";

    interface Props {
        wishlist?: SteamWishlist,
        filterCategories: FilterOptions,
        filterGenres: FilterOptions,
        bgHighlight: string
    }

    let { wishlist, filterCategories, filterGenres, bgHighlight = $bindable() }: Props = $props();

    let wishlistItems = $state<SteamWishlistItem[]>(wishlist ? wishlist.items : []);
</script>

<section id="wishlist" class="w-full h-full flex-1 bg-gray-900/80">
    <WishlistFilter 
        wishlist={wishlist} 
        categoriesOptions={filterCategories}
        genresOptions={filterGenres}
        bind:items={wishlistItems}
        bind:bgHighLight={bgHighlight}
    />

    <ul class="w-full grid grid-cols-1 xl:grid-cols-2 gap-5 px-2 py-5  md:p-5 lg:p-10">
        {#key wishlistItems}
            {#each wishlistItems as item}
                <li>
                    <WishlistItem item={item} bind:bgHighlight={bgHighlight} />
                </li>
            {/each}
        {/key}
    </ul>
</section>