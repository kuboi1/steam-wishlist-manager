<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import { getLocalStorageItem, LS_KEY_USER, setLocalStorageItem } from "$lib/localstorage";
    import type { SteamUser } from "$lib/steamapi";
    import axios from "axios";
    import { onMount } from "svelte";

    let steamId = $state('');
    let steamIdValid = $state(false);
    let steamUser = $state<SteamUser|null>(null);
    let loadingUser = $state(false);

    let isInputFilled = $derived(steamId.length === 17);

    onMount(async () => {
        const savedUser = await getLocalStorageItem(LS_KEY_USER);

        if (savedUser) {
            console.log('saved user', savedUser);
            await goto('/wishlist');
        }
    })

    const onSteamIdInput = (e: Event) => {
        const input = e.target as HTMLInputElement;
        // Only allow numbers
        steamId = input.value.replace(/[^0-9]/g, '');

        validateSteamId();
    }

    const validateSteamId = () => {
        steamIdValid = /^7656119\d{10}$/.test(steamId);

        if (steamIdValid) {
            loadingUser = true;
            axios.get('/api/steam/user', {
                params: { steamid: steamId }
            })
            .then((response) => {
                steamUser = response.data;
                loadingUser = false;
            })
        } else {
            steamUser = null;
        }
    }

    const confirmId = () => {
        // Save user to local storage
        setLocalStorageItem(LS_KEY_USER, steamUser, null);
        
        // Navigate to home page
        goto('/home');
    }
</script>

<div class="w-screen h-screen overflow-hidden flex justify-center items-center">
    <div class="flex flex-col lg:items-center gap-4">
        <h1 class="fade-in-enlarge lg:mb-2">
            Hi, welcome to <strong>Steam&nbsp;Wishlist&nbsp;Manager</strong>
        </h1>
        <div class="opacity-0 text-sm lg:text-lg fade-in-enlarge [animation-delay:.5s]">
            Enter your Steam ID below to get started
        </div>
        <div class="w-full lg:w-1/2">
            <input 
                type="text"
                class="w-full opacity-0 fade-in-enlarge [animation-delay:1s]"
                placeholder="7656119xxxxxxxxxx"
                maxlength="17"
                bind:value={steamId}
                oninput={onSteamIdInput}
            />
            <span 
                class="w-full text-sm mt-2"
                class:opacity-0={!isInputFilled}
                class:text-neutral-600={!steamUser}
                class:text-green-500={steamUser}
            >
                {#if loadingUser}
                    Checking...
                {:else if steamIdValid && steamUser}
                    What's up, <strong>{steamUser?.username}</strong>!
                {:else}
                    Invalid Steam ID
                {/if}
            </span>
        </div>
        <Button 
            onclick={confirmId}
            cta="Let's go"
            className={steamUser ? 'opacity-1' : 'opacity-0'}
        />
    </div>
</div>
