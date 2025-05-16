<script lang="ts">
    import Icon from "@iconify/svelte";

    interface Props {
        value: string,
        onsearch: () => void,
        placeholder?: string,
        className?: string
    }

    let { value = $bindable(), onsearch, placeholder, className }: Props = $props();
</script>

<div class={`bg-neutral-50 rounded-lg flex items-center pl-2 ${className}`}>
    <span class="text-black">
        <Icon icon="mdi-light:magnify" width="36" />
    </span>
    <input
        type="text"
        name="gamesSearch"
        placeholder={placeholder ?? 'Search'}
        class="bg-transparent h-12 flex-1 p-0"
        bind:value={value}
        oninput={onsearch}
    />
</div>