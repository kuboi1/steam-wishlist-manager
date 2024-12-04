<script lang="ts">
    let steamId = $state('')
    let steamIdValid = $state(false)

    let isInputTouched = $derived(steamId.length > 0)

    const onSteamIdInput = (e: Event) => {
        const input = e.target as HTMLInputElement;
        // Only allow numbers
        steamId = input.value.replace(/[^0-9]/g, '');

        validateSteamId();
    }

    const validateSteamId = () => {
        steamIdValid = /^7656119\d{10}$/.test(steamId);
    }
</script>

<div class="w-screen h-screen overflow-hidden flex justify-center pt-32 lg:pt-72">
    <div class="flex flex-col lg:items-center gap-4 p-10">
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
                class="w-full text-neutral-600 text-sm mt-2"
                class:opacity-0={!isInputTouched}
                class:text-green-500={steamIdValid}
            >
                {#if steamIdValid}
                    What's up, username!
                {:else}
                    Invalid Steam ID
                {/if}
            </span>
        </div>
    </div>
</div>
