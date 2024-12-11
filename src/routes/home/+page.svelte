<script lang="ts">
    import { goto } from "$app/navigation";
    import { type SteamUser, type SteamWishlist } from "$lib/steamapi";
    import { onMount } from "svelte";
    import ProfileBanner from "$lib/components/ProfileBanner.svelte";
    import axios from "axios";
    import WishlistCollection from "$lib/components/WishlistCollection.svelte";

    let user = $state<SteamUser|null>(null);
    let wishlist = $state<SteamWishlist>();

    onMount(() => {
        const userData = window.localStorage.getItem('steamUser');

        if (!userData) goto('/');

        user = JSON.parse(userData as string) as SteamUser;

        axios.get('/api/steam/wishlist', {
            params: { steamid: user.id }
        })
        .then((response) => {
            wishlist = response.data;
        });
    });
</script>

<header class="w-full px-5 lg:px-20 py-4 border-b border-neutral-600">
    <ProfileBanner user={user as SteamUser}/>
</header>

<main class="w-full p-2 md:p-5 lg:p-10">
    <WishlistCollection wishlist={wishlist} />
</main>