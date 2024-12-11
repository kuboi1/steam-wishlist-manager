<script lang="ts">
    import Icon from "@iconify/svelte";

    interface Props {
        onclick: () => void,
        cta: string,
        variant?: 'primary' | 'secondary'
        className?: string,
        loading?: boolean
    }

    let { onclick, cta, variant, className, loading }: Props = $props();

    variant = variant ?? 'primary';
</script>

<button 
    type="button"
    class={`
        px-10 py-3 rounded-xl transition-all flex items-center gap-1
        ${variant === 'primary' && 'bg-violet-500 hover:bg-violet-400'}
        ${className}
    `}
    onclick={onclick}
>
    <span>{cta}</span>
    {#if loading}
        <span class="animate-spin">
            <Icon icon="fluent:spinner-ios-16-filled" />
        </span>
    {/if}
</button>