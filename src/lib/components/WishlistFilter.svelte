<script lang="ts">
    import type { SteamWishlist, SteamWishlistItem } from "$lib/steamapi";
    import Icon from "@iconify/svelte";
    import SearchInput from "./SearchInput.svelte";
    import ItemFilter from "./ItemFilter.svelte";
    import SelectSort from "./SelectSort.svelte";
    import { onMount } from "svelte";
    import libraryBgImage from "$lib/image/library_bg.webp";
    import ResetFilterButton from "./ResetFilterButton.svelte";

    export const FILTER_ID_ONSALE = 'onsale';
    export const FILTER_ID_FREE = 'free';
    export const FILTER_ID_UNRELEASED = 'unreleased';

    export const SORT_ID_DATE_ADDED = 'date_added';
    export const SORT_ID_NAME = 'name';
    export const SORT_ID_AVAILABILITY = 'availability';
    export const SORT_ID_REVIEWS = 'reviews';
    export const SORT_ID_PRICE = 'price';
    
    export type FilterOptions = { [id: string]: string };
    export type SortOptions = { [id: string]: string };

    interface Props {
        wishlist?: SteamWishlist,
        items: SteamWishlistItem[],
        categoriesOptions: FilterOptions,
        genresOptions: FilterOptions,
        bgHighLight: string
    }

    let { wishlist, items = $bindable(), categoriesOptions, genresOptions, bgHighLight = $bindable() }: Props = $props();

    const otherOptions = {
        onsale: 'On Sale',
        free: 'Free',
        unreleased: 'Unreleased'
    };

    const sortOptions = {
        date_added: 'Date Added',
        name: 'Name Alphabetically',
        reviews: 'Review Score',
        price: 'Price',
        availability: 'Availability'
    };

    let filteredItems = $state<SteamWishlistItem[]>(wishlist ? wishlist.items : []);
    let queriedItems = $state<SteamWishlistItem[]>(wishlist ? wishlist.items : []);

    let activeFilterGenres = $state<Set<string>>(new Set());
    let activeFilterCategories = $state<Set<string>>(new Set());
    let activeFilterOther = $state<Set<string>>(new Set());
    let filterQuery = $state('');
    let activeSortId = $state(SORT_ID_DATE_ADDED);
    let isSortDesc = $state(true);

    let isFilterOpen = $state(false);
    let isQueryOnCooldown = $state(false);
    let queryTimeout = $state(0);

    onMount(() => {
        sortItems();
    });

    const filterItems = () => {
        if (!wishlist) {
            items = [];
            return;
        };

        if (filtersEmpty()) {
            filteredItems = wishlist.items;
        } else {
            filteredItems = wishlist.items.filter((item) => {
                const game = item.game;
                let genresFound = true;
                let categoriesFound = true;
                let othersFound = true;

                if (activeFilterGenres.size > 0) {
                    const foundGenres = [];
                    activeFilterGenres.forEach((genreId) => {
                        if (!game.genres) return;
                        game.genres.forEach((genre) => {
                            if (genre.id == genreId) {
                                foundGenres.push(genreId);
                            }
                        });
                    });
                    genresFound = foundGenres.length === activeFilterGenres.size;
                }

                if (activeFilterCategories.size > 0) {
                    const foundCategories = [];
                    activeFilterCategories.forEach((categoryId) => {
                        if (!game.categories) return;
                        game.categories.forEach((category) => {
                            if (category.id == categoryId) {
                                foundCategories.push(categoryId);
                            }
                        });
                    });
                    categoriesFound = foundCategories.length === activeFilterCategories.size;
                }

                if (activeFilterOther.size > 0) {
                    const foundOthers = [];
                    activeFilterOther.forEach((otherId) => {
                        if (otherId === FILTER_ID_ONSALE) {
                            if (game.price?.discountPercent) {
                                foundOthers.push(otherId);
                            }
                        }
                        if (otherId === FILTER_ID_FREE) {
                            if (game.isFree) {
                                foundOthers.push(otherId);
                            }
                        }
                        if (otherId === FILTER_ID_UNRELEASED) {
                            if (game.releaseDate.comingSoon) {
                                foundOthers.push(otherId);
                            }
                        }
                    });
                    othersFound = foundOthers.length === activeFilterOther.size;
                }

                return genresFound && categoriesFound && othersFound;
            });
        }

        items = filteredItems.filter((item) => queriedItems.includes(item));

        sortItems();
    };

    const queryItems = () => {
        if (isQueryOnCooldown) {
            queryTimeout = setTimeout(() => {
                isQueryOnCooldown = false;
                queryItems()
            }, 200);
            return;
        };
        clearTimeout(queryTimeout);

        const query = filterQuery.toLowerCase().trim();
        isQueryOnCooldown = true;

        if (!wishlist) {
            items = [];
            return;
        };

        if (query === '') {
            queriedItems = wishlist.items;
        } else {
            queriedItems = wishlist.items.filter((item) => {
                const game = item.game;

                if (game.name.toLowerCase().includes(query)) return true;

                let devs: string[] = [];
                if (game.developers) devs = [...game.developers];
                if (game.publishers) devs = [...devs, ...game.publishers];

                let devsFound = false;

                devs.forEach((dev) => {
                    if (dev.toLowerCase().includes(query)) {
                        devsFound = true;
                    }
                });

                return devsFound;
            });
        }

        items = queriedItems.filter((item) => filteredItems.includes(item));

        sortItems();
    }

    const sortItems = () => {
        // Sort in descending order
        switch (activeSortId) {
            case SORT_ID_DATE_ADDED:
                items = items.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
                break;
            case SORT_ID_NAME:
                items = items.sort((a, b) => a.game.name.localeCompare(b.game.name));
                break;
            case SORT_ID_REVIEWS:
                items = items.sort((a, b) => Number(b.game.reviews?.score) - Number(a.game.reviews?.score));
                break;
            case SORT_ID_PRICE:
                items = items.sort((a, b) => {
                    if (!a.game.price) return 1;
                    if (!b.game.price) return -1;
                    return b.game.price.final - a.game.price.final;
                });
                break;
            case SORT_ID_AVAILABILITY:
                items = items.sort((a, b) => Number(a.game.releaseDate.comingSoon) - Number(b.game.releaseDate.comingSoon));
                break;
        }

        // Reverse if ascending selected
        if (!isSortDesc) {
            items = items.reverse()
        }

        items = [...items];

        bgHighLight = libraryBgImage;
    }

    const resetAll = () => {
        activeFilterCategories = new Set();
        activeFilterGenres = new Set();
        activeFilterOther = new Set();
        activeSortId = SORT_ID_DATE_ADDED;
        isSortDesc = true;
        filterQuery = '';

        filterItems();
        queryItems();
        sortItems();
    }

    const filtersEmpty = () => activeFilterGenres.size === 0 && activeFilterCategories.size === 0 && activeFilterOther.size === 0;
</script>

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
            w-full pl-5 lg:pl-8 pr-14 py-5 lg:py-8 bg-gray-900/[98%] border-b border-neutral-600 shadow-md space-y-5 
            transition-transform duration-500 absolute top-0
            ${isFilterOpen ? 'translate-y-0 ease-out' : '-translate-y-[150%] ease-in'}
        `}
    >
        <div class="w-full pb-4 border-b border-gray-500">
            <div class="flex items-center gap-2 text-2xl">
                <span>FILTER GAMES</span>
                <ResetFilterButton title="Reset All Filters" size="20" onreset={resetAll} />
            </div>
        </div>
        <div class="w-full flex flex-col md:flex-row justify-between gap-4">
            <div class="w-full md:w-1/2 xl:w-1/3 space-y-2">
                <div class="flex items-center gap-2">
                    <span>SEARCH</span>
                    <ResetFilterButton 
                        title="Reset Search" 
                        size="16" 
                        onreset={() => {
                            filterQuery = '';
                            queryItems();
                        }}
                    />
                </div>
                <SearchInput bind:value={filterQuery} onsearch={queryItems} placeholder="Search Games" className="w-full" />
            </div>
            <SelectSort
                options={sortOptions}
                onsort={sortItems}
                bind:selectedOption={activeSortId}
                bind:isDesc={isSortDesc}
            />
        </div>
        <ItemFilter 
            type="genre" 
            label="Genres"
            items={genresOptions}
            onfilter={filterItems}
            bind:activeItemIds={activeFilterGenres}
        />
        <ItemFilter 
            type="category" 
            label="Categories"
            items={categoriesOptions}
            onfilter={filterItems}
            bind:activeItemIds={activeFilterCategories}
        />
        <ItemFilter 
            type="other" 
            label="Other"
            items={otherOptions}
            onfilter={filterItems}
            bind:activeItemIds={activeFilterOther}
        />
        <div class="w-fit min-w-52 pt-4 text-xl space-x-1 border-t border-gray-500">
            {#if items.length > 0}
                <span>GAMES FOUND:</span>
                <span class="font-bold text-sky-500">{`${items.length} ${items.length >= 1000 ? '💀' : ''}`}</span>
            {:else}
                <span>NO GAMES FOUND:(</span>
            {/if}
        </div>
    </div>
</nav>