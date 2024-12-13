<script lang="ts">
    import Icon from "@iconify/svelte";
    import type { FilterOptions } from "./WishlistCollection.svelte";

    type ItemFilterType = 'genre' | 'category' | 'other';

    interface Props {
        type: ItemFilterType,
        label: string,
        items: FilterOptions,
        activeItemIds: Set<string>
    }

    let { type, label, items, activeItemIds = $bindable() }: Props = $props();

    let rotateResetButton = $state(false);

    const handleItemClick = (itemId: string) => {
        if (activeItemIds.has(itemId)) {
            activeItemIds.delete(itemId);
        } else {
            activeItemIds.add(itemId);
        }
        activeItemIds = new Set(activeItemIds);
    }

    const handleFilterReset = () => {
        activeItemIds = new Set();
        rotateResetButton = true;
        setTimeout(() => rotateResetButton = false, 500)
    }
</script>

<div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
        <span>{label.toUpperCase()}</span>
        <button
            class="transition-colors text-gray-300 hover:text-neutral-50"
            class:animate-spin={rotateResetButton}
            title={`Reset ${label}`}
            onclick={handleFilterReset}
        >
            <Icon icon="jam:refresh" height="16" />
        </button>
    </div>
    <ul class="flex items-center gap-1 flex-wrap text-xs">
        {#each Object.keys(items) as itemId}
            <li>
                <button
                    class={`
                        py-1 px-2 rounded-full transition-colors
                        ${activeItemIds.has(itemId) ? 'bg-gray-500 hover:bg-gray-500' : 'bg-gray-700 hover:bg-gray-600'}
                    `}
                    onclick={() => handleItemClick(itemId)}
                >
                    {items[itemId]}
                </button>
            </li>
        {/each}
    </ul>
</div>