<script lang="ts">
    import type { SteamWishlistItem } from "$lib/steamapi";

    interface Props {
        item: SteamWishlistItem
    }

    let { item }: Props = $props();

    const { game} = item;
    const dateAdded = new Date(item.dateAdded);

    const formatDate = (date: Date) => `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
</script>

<article class="
        w-full p-4 border border-neutral-500 flex flex-col lg:flex-row gap-4 rounded-lg lg:max-h-40
        transition-all hover:shadow-lg hover:translate-x-1 hover:-translate-y-1 hover:border-white
    "
>
    <img 
        src={game.headerImageUrl} 
        alt={game.name} 
        title={game.name}
        class="block rounded-lg object-contain max-h-full max-w-full lg:max-w-64"
    />

    <div class="flex flex-col">
        <span class="text-md xl:text-lg font-bold">{game.name}</span>
        <span class="text-sm mb-1">Date added: {formatDate(dateAdded)}</span>
        {#if game.price}
            {#if game.price.discountPercent}
                <div class="space-x-1">
                    <span class="line-through">{game.price.initial}</span>
                    <span>{game.price.final}</span>
                </div>
            {:else}
                <div>{game.price.final}</div>
            {/if}
        {:else}
            <span>Unavailable</span>
        {/if}
    </div>
</article>