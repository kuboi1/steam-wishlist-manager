<script lang="ts">
    import type { SteamWishlistItem } from "$lib/steamapi";
    import ItemSlider from "./ItemSlider.svelte";
    import { formatDate, formatPrice } from "$lib/utils";

    interface Props {
        item: SteamWishlistItem,
        bgHighlight?: string|null
    }

    let { item, bgHighlight = $bindable() }: Props = $props();

    const { game } = item;

    const steamLink = `https://store.steampowered.com/app/${game.id}`;
    const dateAdded = new Date(item.dateAdded);
    const reviewScore = (game.reviews?.total && game.reviews?.total > 0) ? 
        Math.round((game.reviews.positive / game.reviews.total) * 100) : undefined;

    const updateBgHighlight = () => {
        bgHighlight = game.bgImage;
    }
</script>

<article 
    class="
        w-full p-4 bg-gray-800/90 border border-neutral-500 flex flex-col lg:flex-row gap-4 rounded-lg group shadow-md
        transition-all hover:shadow-lg hover:border-white hover:bg-gray-800 xl:hover:scale-[1.02]
    "
    onmouseover={updateBgHighlight}
    onfocus={updateBgHighlight}
>
    <div class="relative overflow-hidden min-h-32 w-full xl:w-5/12 rounded-lg">
        <div 
            style={`background-image: url(${game.headerImageUrl})`}
            class="bg-cover bg-center group-hover:scale-105 transition-transform h-48 md:h-full"
        ></div>
        {#if game.reviews && reviewScore}
            <div class={`
                    absolute inset-0 p-2 text-xl rounded-br-lg hover:rounded-br-none h-fit w-14 hover:w-full
                    text-nowrap overflow-x-hidden select-none shadow-sm
                    opacity-80 hover:opacity-100 transition-all group/review 
                    ${reviewScore >= 70 ? 'bg-sky-700' : ''}
                    ${(reviewScore < 70 && reviewScore >= 40) ? 'bg-amber-400' : ''}
                    ${reviewScore < 40 ? 'bg-red-700' : ''}
                `}
            >
                <span class="inline group-hover/review:hidden">
                    {reviewScore}%
                </span>
                <span class="hidden group-hover/review:inline-flex w-full items-center justify-between space-x-1">
                    <span
                        class:text-base={game.reviews.total < 100000}
                        class:text-sm={game.reviews.total > 100000}
                    >
                        {game.reviews.label}
                    </span>
                    <span 
                        class:text-sm={game.reviews.total < 100000}
                        class:text-xs={game.reviews.total > 100000}
                    >
                        ({game.reviews.positive.toLocaleString()}/{game.reviews.total.toLocaleString()})
                    </span>
                </span>
            </div>
        {/if}
    </div>

    <div class="w-full xl:w-7/12 space-y-2 text-gray-200">
        <div class="flex flex-col flex-shrink gap-1">
            <div class="flex flex-col">
                <a 
                    href={steamLink}
                    target="_blank"
                    class="
                        text-md xl:text-xl font-bold overflow-x-hidden text-nowrap text-ellipsis text-neutral-0
                        max-w-fit pr-2 hover:underline
                    "
                    title={game.name}
                >
                    {game.name}
                </a>
                {#if game.publishers}
                    <span class="text-sm overflow-x-hidden text-nowrap text-ellipsis">
                        {[...new Set([...game.developers, ...game.publishers])].join(', ')}
                    </span>
                {/if}
            </div>
            <span class="text-sm mb-1">Date added: {formatDate(dateAdded)}</span>
            <div class="space-x-1 my-1">
                {#if game.price}
                    <a 
                        href={steamLink}
                        target="_blank"
                        class={`
                            w-fit px-2 py-1 rounded-full transition-colors hover:rounded-xl
                            ${game.price.discountPercent ? 'font-bold bg-emerald-700 hover:bg-emerald-600' : 'bg-indigo-700 hover:bg-indigo-600'}
                        `}
                    >
                        {formatPrice(game.price.final, game.price.currency)}
                    </a>
                    {#if game.price.discountPercent}
                        <span class="line-through text-sm">{formatPrice(game.price.initial, game.price.currency)}</span>
                    {/if}
                {:else}
                    <a 
                        href={steamLink}
                        target="_blank"
                        class={`
                            w-fit px-2 py-1  transition-colors rounded-full hover:rounded-lg
                            ${(!game.releaseDate.comingSoon && game.isFree) ? 'bg-cyan-700 hover:bg-cyan-600' : 'bg-neutral-600 hover:bg-neutral-500'}
                        `}
                    >
                        {(!game.releaseDate.comingSoon && game.isFree) ? 'Free:)' : 'Unreleased:('}
                    </a>
                    {#if !game.isFree}
                        <span class="text-xs">({game.releaseDate.date})</span>
                    {/if}
                {/if}
            </div>
        </div>
        <div class="pt-2 border-t border-gray-700 space-y-2">
            {#if game.genres}
                <ItemSlider items={game.genres.map((genre) => genre.description)} variant="primary" />
            {/if}
            {#if game.categories}
                <ItemSlider items={game.categories.map((category) => category.description)} variant="secondary" />
            {/if}
        </div>
    </div>
</article>