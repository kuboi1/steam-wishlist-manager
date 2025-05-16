<script lang="ts">
    import { getLocalStorageItem, LS_KEY_WISHLIST } from '$lib/localstorage';
    import type { SteamGame, SteamWishlist } from '$lib/steamapi';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { fade } from 'svelte/transition';
    import LoadedGamesList from '$lib/components/LoadedGamesList.svelte';
    import WishlistFetcher from '$lib/components/WishlistFetcher.svelte';
    import libraryBgImage from "$lib/image/library_bg.webp";

    let { data }: { data: PageData } = $props();

    type SectionId = 'fetcher' | 'games';

    const sections: {id: SectionId, label: string}[] = [
        {id: 'fetcher', label: 'Fetcher'},
        {id: 'games', label: 'Loaded Games'}
    ];

    let wishlist = $state<SteamWishlist|null>(null);
    let loadedGames = $state<SteamGame[]>([]);
    let refreshGameIds = $state<Set<string>>(new Set());

    let openedSection = $state<SectionId>('fetcher');

    onMount(async () => {
        await loadWishlist();
    })

    const handleSwitchSection = async (id: SectionId) => {
        openedSection = id;

        if (id === 'games') await loadWishlist();
    }

    const loadWishlist = async () => {
        const savedWishlist = await getLocalStorageItem(LS_KEY_WISHLIST);
        
        wishlist = savedWishlist ? savedWishlist as SteamWishlist : null;

        if (wishlist) {
            loadedGames = wishlist.items.map((item) => item.game);
        }
    }
</script>

<div
    class="bg-cover flex-1 flex overflow-hidden"
    style={`background-image: url('${libraryBgImage}')`}
>
    <div class="w-full flex flex-col justify-start md:justify-center pt-[25%] md:pt-0 items-center p-2 bg-gray-900/95">
        <div class="w-full md:w-1/2">
            <div class="w-full flex gap-1">
                {#each sections as section}
                    <button
                        class={`
                            py-1 px-2 rounded-t-lg transition-colors
                            ${openedSection === section.id ? 'bg-sky-600' : 'bg-sky-800 hover:bg-sky-700'}
                        `}
                        onclick={() => handleSwitchSection(section.id)}
                    >
                        {section.label}
                    </button>
                {/each}
            </div>
            <div  class="w-full h-full xl:h-fit p-5 bg-gray-800 border border-gray-600 rounded-b-xl rounded-tr-xl shadow-md">
                {#if openedSection === 'fetcher'}
                    <section
                        in:fade={{ duration: 333 }}
                    >
                        <WishlistFetcher 
                            wishlist={wishlist}
                            refreshGameIds={refreshGameIds}
                        />
                    </section>
                {:else if openedSection === 'games'}
                    <section 
                        class="w-full"
                        in:fade={{ duration: 333 }}
                    >
                        {#if wishlist && loadedGames.length > 0}
                            <LoadedGamesList 
                                games={loadedGames} 
                                bind:refreshGameIds={refreshGameIds} 
                            />
                        {:else}
                            No Games Loaded Yet
                        {/if}
                    </section>
                {/if}
            </div>
        </div>
    </div>
</div>