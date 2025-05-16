<script lang="ts">
    import Icon from "@iconify/svelte";

    interface Props {
        title: string,
        size: string|number,
        onreset: () => void
    }

    let { title, size, onreset }: Props = $props();

    let isSpinning = $state(false);

    const handleClick = () => {
        isSpinning = true;
        setTimeout(() => isSpinning = false, 500);

        onreset();
    }
</script>

<button
    class="transition-colors text-gray-300 hover:text-neutral-50"
    class:animate-spin={isSpinning}
    title={title}
    onclick={handleClick}
>
    <Icon icon="jam:refresh" height={size} />
</button>