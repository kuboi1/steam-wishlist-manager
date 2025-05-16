<script lang="ts">
    import Icon from "@iconify/svelte";
    import type { FilterOptions } from "./WishlistFilter.svelte";
    import ResetFilterButton from "./ResetFilterButton.svelte";

    type ItemFilterType = 'genre' | 'category' | 'other';

    interface Props {
        type: ItemFilterType,
        label: string,
        items: FilterOptions,
        activeItemIds: Set<string>,
        onfilter: () => void
    }

    let { type, label, items, activeItemIds = $bindable(), onfilter }: Props = $props();

    const handleItemClick = (itemId: string) => {
        if (activeItemIds.has(itemId)) {
            activeItemIds.delete(itemId);
        } else {
            activeItemIds.add(itemId);
        }
        activeItemIds = new Set(activeItemIds);

        onfilter();
    }

    const handleFilterReset = () => {
        activeItemIds = new Set();
        onfilter();
    }
</script>

<div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
        <span>{label.toUpperCase()}</span>
        <ResetFilterButton title={`Reset ${label}`} size="16" onreset={handleFilterReset}  />
    </div>
    <ul class="flex items-center gap-1 flex-wrap text-xs">
        {#each Object.keys(items) as itemId}
            <li>
                <button
                    class={`
                        py-1 px-2 rounded-full transition-colors outline-1 outline-neutral-300
                        ${activeItemIds.has(itemId) ? 'bg-gray-500 hover:bg-gray-600 outline' : 'bg-neutral-800 hover:bg-neutral-700'}
                    `}
                    onclick={() => handleItemClick(itemId)}
                >
                    {items[itemId]}
                </button>
            </li>
        {/each}
    </ul>
</div>