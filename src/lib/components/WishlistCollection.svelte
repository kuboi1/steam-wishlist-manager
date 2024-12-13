<script lang="ts">
    import type { SteamWishlist } from "$lib/steamapi";
    import Icon from "@iconify/svelte";
    import WishlistItem from "./WishlistItem.svelte";
    import ItemFilter from "./ItemFilter.svelte";

    export const FILTER_ID_ONSALE = 'onsale';

    export type FilterOptions = { [id: string]: string };

    interface Props {
        wishlist?: SteamWishlist,
        filterCategories: FilterOptions,
        filterGenres: FilterOptions,
        bgHighlight?: string|null
    }

    let { wishlist, filterCategories, filterGenres, bgHighlight = $bindable() }: Props = $props();

    const filterOther = {
        onsale: 'ON SALE'
    };

    let activeFilterGenres = $state<Set<string>>(new Set());
    let activeFilterCategories = $state<Set<string>>(new Set());
    let activeFilterOther = $state<Set<string>>(new Set());

    let isFilterOpen = $state(false);
</script>

<section id="wishlist" class="h-fit flex-1 bg-gray-900/80">
    <nav class="w-full sticky inset-0 z-40">
        <button 
            class={`
                absolute top-0 right-0 p-2 rounded-bl-lg transition-colors z-40 shadow-lg border-b border-l border-neutral-600
                ${isFilterOpen ? 'bg-gray-700 hover:bg-gray-800' : 'bg-gray-800 hover:bg-gray-700'}
            `}
            onclick={() => isFilterOpen = !isFilterOpen}
        >
            <Icon icon="fluent:filter-16-filled" width="35" />
        </button>
        <div class={`
                w-full px-5 lg:px-10 py-5 lg:py-8 bg-gray-900/95 border-b border-neutral-600 shadow-md space-y-5 
                transition-transform duration-500 ease-out absolute top-0
                ${isFilterOpen ? 'translate-y-0' : '-translate-y-[150%]'}
            `}
        >
            <ItemFilter 
                type="genre" 
                label="Genres"
                items={filterGenres}
                bind:activeItemIds={activeFilterGenres}
            />
            <ItemFilter 
                type="category" 
                label="Categories"
                items={filterCategories}
                bind:activeItemIds={activeFilterCategories}
            />
            <ItemFilter 
                type="other" 
                label="Other"
                items={filterOther}
                bind:activeItemIds={activeFilterOther}
            />
        </div>
    </nav>

    <ul class="grid grid-cols-1 xl:grid-cols-2 3xl:grid-cols-3 gap-5 px-2 py-5  md:p-5 lg:p-10">
        {#if wishlist}
            {#each wishlist.items as item}
                <li>
                    <WishlistItem item={item} bind:bgHighlight={bgHighlight} />
                </li>
            {/each}
        {/if}
    </ul>
</section>