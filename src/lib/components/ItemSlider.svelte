<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        items: string[],
        variant?: 'primary' | 'secondary'
    }

    let { items, variant }: Props = $props();

    variant = variant ?? 'primary';

    let container = $state<HTMLUListElement|undefined>(undefined);

    let isDragging = $state(false);
    let startX = $state(0);
    let scrollStart = $state(0);
    let scrollVelocity = $state(0);
    let animationFrame = $state(0);

    let overflowingLeft = $state(false);
    let overflowingRight = $state(false);

    const isOverflowing = $derived(container ? container.scrollWidth > container.clientWidth : false);

    onMount(() => {
        updateOverflow();
    });

    const handleDragStart = (e: MouseEvent|TouchEvent) => {
        if (!isOverflowing || !container) return;

        const source = e instanceof MouseEvent ? e : e.touches[0];

        isDragging = true;
        startX = source.clientX;
        scrollStart = container.scrollLeft;
        scrollVelocity = 0;

        cancelAnimationFrame(animationFrame);
    }

    const handleDragEnd = () => {
        if (!isOverflowing) return;

        isDragging = false;

        scroll();
    }

    const handleDragMove = (e: MouseEvent|TouchEvent) => {
        if (!isDragging || !container || !isOverflowing) return;

        const source = e instanceof MouseEvent ? e : e.touches[0];

        const dx = source.clientX - startX;
        container.scrollLeft -= scrollVelocity;

        scrollVelocity = source.clientX - startX;
        startX = source.clientX;
    }

    const updateOverflow = () => {
        if (!isOverflowing || !container) return;

        overflowingRight = (container.scrollLeft + container.clientWidth) < (container.scrollWidth - 5);
        overflowingLeft = container.scrollLeft > 0;
    }

    const scroll = () => {
        if (!isOverflowing || !container) return;

        const FRICTION = 0.95;
        const STOP_THRESHOLD = 0.1;

        if (Math.abs(scrollVelocity) > STOP_THRESHOLD) {
            container.scrollLeft -= scrollVelocity;
            scrollVelocity *= FRICTION;

            animationFrame = requestAnimationFrame(scroll)
        }
    };
</script>

<div class="relative">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <ul 
        class="flex gap-1 overflow-x-hidden flex-nowrap text-xs select-none"
        class:cursor-grab={isOverflowing && !isDragging}
        class:cursor-grabbing={isOverflowing && isDragging}
        bind:this={container}
        onmousedown={handleDragStart}
        ontouchstart={handleDragStart}
        onmouseup={handleDragEnd}
        ontouchend={handleDragEnd}
        onmouseleave={handleDragEnd}
        ontouchcancel={handleDragEnd}
        onmousemove={handleDragMove}
        ontouchmove={handleDragMove}
        onscroll={updateOverflow}
        role="application"
        aria-label="Scrollable container for items"
    >
        {#each items as item}
            <li class={`
                    text-nowrap py-1 px-2 rounded-full
                    ${variant === 'primary' && 'bg-gray-500'}
                    ${variant === 'secondary' && 'bg-gray-700'}
                `}
            >
                {item}
            </li>
        {/each}
    </ul>

    <div 
        class="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-gray-800/90 to-transparent pointer-events-none opacity-1 transition-opacity"
        class:opacity-0={!overflowingLeft}
    ></div>
    <div 
        class="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-gray-800/90  to-transparent pointer-events-none opacity-1 transition-opacity"
        class:opacity-0={!overflowingRight}
    ></div>
</div>
