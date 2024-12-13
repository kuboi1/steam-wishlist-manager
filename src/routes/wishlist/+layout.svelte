<script lang="ts">
    import { onMount, type Snippet } from 'svelte';
    import type { LayoutData } from './$types';
    import { getLocalStorageItem, LS_KEY_USER } from '$lib/localstorage';
    import { goto } from '$app/navigation';
    import type { SteamUser } from '$lib/steamapi';
    import ProfileBanner from '$lib/components/ProfileBanner.svelte';
    import Icon from '@iconify/svelte';
    import { page } from '$app/stores';

    let { children }: { children: Snippet } = $props();

    let user = $state<SteamUser|undefined>();

    onMount(async () => {
        const userData = await getLocalStorageItem(LS_KEY_USER);

        if (!userData) await goto('/');

        user = userData as SteamUser;
    });

    const isMainRoute = () => $page.route.id === '/wishlist';
</script>

<header class="w-full px-5 lg:px-20 py-4 bg-gray-900 border-b border-neutral-600 z-50">
    <div class="w-full flex justify-between items-center max-w-screen-4xl mx-auto">
        <ProfileBanner user={user as SteamUser}/>

        <div class="transition-colors rounded-lg bg-sky-500 hover:bg-sky-400">
            <a 
                href={isMainRoute() ? '/wishlist/fetch' : '/wishlist'}
                class="flex gap-1 py-1 px-2"
            >
                    <span>{isMainRoute() ? 'Wishlist Fetcher' : 'Go To Wishlist'}</span>
                    <span>
                        <Icon icon={isMainRoute() ? 'mdi:steam' : 'cuida:list-outline' } width="25" />
                    </span>
            </a>
        </div>
    </div>
</header>

<main class="w-full max-w-screen-4xl mx-auto min-h-full flex flex-col flex-1">
    {@render children()}
</main>