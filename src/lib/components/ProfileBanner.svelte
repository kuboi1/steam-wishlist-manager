<script lang="ts">
    import { goto } from "$app/navigation";
    import { bulkRemoveLocalStorageItems, LS_KEY_USER, LS_KEY_WISHLIST } from "$lib/localstorage";
    import type { SteamUser } from "$lib/steamapi";
    import Icon from "@iconify/svelte";
    import axios from "axios";

    interface Props {
        user: SteamUser
    }

    let { user }: Props = $props();

    const profileLink = `https://steamcommunity.com/profiles/${user?.id}`;

    let profileRefreshAvailable = $state(true);
    let profileRefreshing = $state(false);

    const refreshProfile = () => {
        if (!profileRefreshAvailable) return;

        profileRefreshing = true;

        axios.get('/api/steam/user', {
            params: { steamid: user?.id }
        })
        .then((response) => {
            const userData = response.data;
            user = userData as SteamUser;
            window.localStorage.setItem('steamUser', JSON.stringify(userData));
            profileRefreshing = false;
            profileRefreshAvailable = false;
            setTimeout(() => profileRefreshAvailable = true, 3000);
        });
    }

    const switchProfile = () => {
        bulkRemoveLocalStorageItems([
            LS_KEY_USER,
            LS_KEY_WISHLIST
        ]);
        goto('/');
    }
</script>

<div class="flex gap-4">
    <a
        href={profileLink}
        target="_blank"
        class="w-16 rounded-full overflow-hidden hover:scale-105 transition-transform"
    >
        <img 
            src={user?.avatarUrl} 
            alt="Profile"
        />
    </a>
    <div class="py-1 space-y-1">
        <div class="text-lg flex items-center gap-1">
            <a href={profileLink} target="_blank">{user?.username}</a>
            <button
                type="button"
                title={`Refresh ${profileRefreshAvailable ? 'Profile' : 'Unavailable'}`}
                onclick={refreshProfile}
                class="transition-transform hover:rotate-180"
                class:text-neutral-600={!profileRefreshAvailable}
                class:cursor-default={!profileRefreshAvailable}
                class:animate-spin={profileRefreshing}
            >
                <Icon icon="jam:refresh" height="16" />
            </button>
        </div>
        <div>
            <button class="flex items-center gap-1 overflow-hidden group" onclick={switchProfile}>
                <Icon icon="mdi:logout-variant" height="18" />
                <span class="text-xs transition-transform lg:-translate-x-28 group-hover:translate-x-0">
                    Switch Account
                </span>
            </button>
        </div>
    </div>
</div>