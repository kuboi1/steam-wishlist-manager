<script lang="ts">
    import Icon from "@iconify/svelte";
    import type { SortOptions } from "./WishlistFilter.svelte";

    interface Props {
        options: SortOptions,
        selectedOption: string,
        isDesc: boolean,
        onsort: () => void
    }

    let { options, selectedOption = $bindable(), isDesc = $bindable(), onsort }: Props = $props();

    const setDesc = (value: boolean) => {
        isDesc = value;
        onsort();
    }
</script>

<div class="w-full md:w-1/3 lg:1/4 space-y-2">
    <label class="flex items-center gap-2" for="sort">
        <span>SORT BY</span>
    </label>
    <div class="flex justify-between">
        <select
            name="sort"
            class="text-black w-11/12 p-2 h-12 rounded-lg outline-sky-500 focus:outline"
            onchange={() => onsort()}
            bind:value={selectedOption}
        >
            {#each Object.keys(options) as optionId}
                <option class="bg-gray-200" value={optionId}>
                    {options[optionId]}
                </option>
            {/each}
        </select>
        <div class="w-1/12 flex flex-col justify-center items-center">
            <button
                disabled={!isDesc}
                class="transition-colors"
                class:text-neutral-500={isDesc}
                class:hover:text-neutral-400={isDesc}
                title="Ascending"
                onclick={() => setDesc(false)}
            >
                <Icon icon="raphael:arrowup" width="22" />
            </button>
            <button
                disabled={isDesc}
                class="transition-colors"
                class:text-neutral-500={!isDesc}
                class:hover:text-neutral-400={!isDesc}
                title="Descending"
                onclick={() => setDesc(true)}
            >
                <Icon icon="raphael:arrowdown" width="22" />
            </button>
        </div>
    </div>
</div>