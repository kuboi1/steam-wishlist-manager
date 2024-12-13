<script lang="ts">
    import type { SteamWishlistItem } from "$lib/steamapi";
    import ItemSlider from "./ItemSlider.svelte";

    interface Props {
        item: SteamWishlistItem,
        bgHighlight?: string|null
    }

    let { item, bgHighlight = $bindable() }: Props = $props();

    const { game } = item;
    const dateAdded = new Date(item.dateAdded);

    const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    const updateBgHighlight = () => {
        bgHighlight = game.bgImage;
    }
</script>

<article 
    class="
        w-full p-4 bg-gray-800/90 border border-neutral-500 flex flex-col lg:flex-row gap-4 rounded-lg group shadow-md
        transition-all hover:shadow-lg hover:border-white hover:bg-gray-800 xl:hover:translate-x-1 xl:hover:-translate-y-1
    "
    onmouseover={updateBgHighlight}
    onfocus={updateBgHighlight}
>
    <div class="overflow-hidden min-h-32 w-full xl:w-2/5 rounded-lg">
        <div 
            style={`background-image: url(${game.headerImageUrl})`}
            title={game.name}
            class="bg-cover bg-center group-hover:scale-105 transition-transform h-48 md:h-full"
        ></div>
    </div>

    <div class="w-full xl:w-3/5 space-y-2 text-gray-200">
        <div class="flex flex-col flex-shrink gap-1">
            <div class="flex flex-col">
                <span 
                    class="text-md xl:text-xl font-bold overflow-x-hidden text-nowrap text-ellipsis text-neutral-0"
                    title={game.name}
                >
                    {game.name}
                </span>
                <span class="text-sm overflow-x-hidden text-nowrap text-ellipsis">{[...new Set([...game.developers, ...game.publishers])].join(', ')}</span>
            </div>
            <span class="text-sm mb-1">Date added: {formatDate(dateAdded)}</span>
            {#if game.price}
                <div class="space-x-1 my-1">
                    <a 
                        href={`https://store.steampowered.com/app/${game.id}`}
                        target="_blank"
                        class={`
                            w-fit px-2 py-1 rounded-full transition-colors hover:rounded-xl
                            ${game.price.discountPercent ? 'font-bold bg-emerald-700 hover:bg-emerald-600' : 'bg-indigo-700 hover:bg-indigo-600'}
                        `}
                    >
                        {game.price.final}
                    </a>
                    {#if game.price.discountPercent}
                        <span class="line-through text-sm">{game.price.initial}</span>
                    {/if}
                </div>
            {:else}
                <div>
                    <span>Unavailable:(</span>
                    <span class="text-xs">(Releases in {game.releaseDate})</span>
                </div>
            {/if}
        </div>
        <div class="pt-2 border-t border-gray-700 space-y-2">
            <ItemSlider items={game.genres.map((genre) => genre.description)} variant="primary" />
            <ItemSlider items={game.categories.map((category) => category.description)} variant="secondary" />
        </div>
    </div>
</article>