<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        onreachend: () => Promise<void>,
        loadMoreCondition: boolean,
        loadMoreThreshold?: number,
        children: Snippet
    }

    let { onreachend, loadMoreCondition, loadMoreThreshold, children }: Props = $props();

    loadMoreThreshold = loadMoreThreshold ?? 500;

    let container = $state<HTMLDivElement|undefined>();

    let scrollY = $state(0);
    let viewportHeight = $state(0);
    let isLoadingMore = $state(false);

    const handleScroll = async () => {
        if (!container) return;

        const documentHeight = document.documentElement.scrollHeight;

        const nearingEnd = scrollY + viewportHeight >= documentHeight - loadMoreThreshold;

        if (nearingEnd && loadMoreCondition) {
            isLoadingMore = true;

            await onreachend();

            setTimeout(() => isLoadingMore = false, 1000);
        }
    }
</script>

<svelte:window on:scroll={handleScroll} bind:scrollY={scrollY} bind:innerHeight={viewportHeight} />

<div bind:this={container}>
    {@render children()}
</div>