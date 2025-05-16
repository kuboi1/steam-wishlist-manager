<script lang="ts">
    import type { SteamGame } from "$lib/steamapi";
    import Icon from "@iconify/svelte";
    import SearchInput from "./SearchInput.svelte";

    interface Props {
        games: SteamGame[],
        refreshGameIds: Set<string>
    }

    let { games, refreshGameIds = $bindable() }: Props = $props();

    let queriedGames = $state<SteamGame[]>(games);

    let gameSearchQuery = $state('');

    const queryLoadedGames = () => {
        const query = gameSearchQuery.toLowerCase().trim();

        if (query === '') {
            queriedGames = games;
            return;
        }

        queriedGames = games.filter((game) => game.name.toLowerCase().includes(query));
    }

    const handleGameClick = (gameId: string) => {
        if (gameSetForReset(gameId)) {
            refreshGameIds.delete(gameId);
        } else {
            refreshGameIds.add(gameId);
        }
        refreshGameIds = new Set(refreshGameIds);
    }

    const setSelectAll = (select: boolean) => {
        if (select) {
            queriedGames.forEach((game) => refreshGameIds.add(game.id))
        } else {
            queriedGames.forEach((game) => refreshGameIds.delete(game.id));
        }
        refreshGameIds = new Set(refreshGameIds);
    }

    const gameSetForReset = (gameId: string) => refreshGameIds.has(gameId);
</script>

<div class="w-full space-y-2">
    <p class="text-sm">Select games you want to re-fetch with the next fetch call</p>
    <div class="flex flex-col gap-2 lg:flex-row justify-between items-start lg:items-end">
        <SearchInput bind:value={gameSearchQuery} onsearch={queryLoadedGames} className="w-full lg:w-1/2" />
        <div class="space-x-2 lg:px-2">
            {#each [true, false] as select}
                <button
                    class={`
                        text-sm py-1 px-2 rounded-lg transition-colors disabled:bg-gray-500
                        ${select ? 'bg-violet-600 hover:bg-violet-500' : 'bg-violet-800 hover:bg-violet-600'}
                    `}
                    onclick={() => setSelectAll(select)}
                    disabled={
                        (select && refreshGameIds.size === queriedGames.length) || 
                        (!select && refreshGameIds.size === 0)
                    }
                >
                    {select ? 'Select All' : 'Deselect All'}
                </button>
            {/each}
        </div>
    </div>
    <div class="w-full bg-gray-900 h-96 xl:h-64 overflow-y-scroll rounded-lg">
        {#each queriedGames as game}
            <article class="border-b last:border-none">
                <button
                    class="w-full py-1 px-4 flex justify-between items-center border-gray-600"
                    class:hover:bg-gray-800={!gameSetForReset(game.id)}
                    class:hover:bg-gray-700={gameSetForReset(game.id)}
                    class:bg-gray-600={gameSetForReset(game.id)}
                    onclick={() => handleGameClick(game.id)}
                >
                    <span class="text-nowrap text-ellipsis overflow-hidden">
                        {game.name}
                    </span>
                    {#if gameSetForReset(game.id)}
                        <span title="Selected for Re-Fetch">
                            <Icon icon="jam:refresh" width="16" />
                        </span>
                    {/if}
                </button>
            </article>
        {/each}
        {#if queriedGames.length === 0}
            <span class="block w-full px-4 py-1">
                No Games:(
            </span>
        {/if}
    </div>
</div>