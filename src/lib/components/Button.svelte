<script lang="ts">
    import Icon from "@iconify/svelte";

    interface Props {
        onclick: () => void,
        cta: string,
        variant?: 'primary' | 'secondary'
        className?: string,
        loading?: boolean,
        disabled?: boolean
    }

    let { onclick, cta, variant, className, loading, disabled }: Props = $props();

    variant = variant ?? 'primary';
</script>

<button 
    type="button"
    class={`
        px-10 py-3 rounded-xl transition-all flex items-center gap-1
        disabled:bg-neutral-400
        ${variant === 'primary' && 'bg-sky-500 hover:bg-sky-400'}
        ${className}
    `}
    onclick={onclick}
    disabled={disabled ?? false}
>
    <span>{cta}</span>
    {#if loading}
        <span class="animate-spin">
            <Icon icon="fluent:spinner-ios-16-filled" />
        </span>
    {/if}
</button>