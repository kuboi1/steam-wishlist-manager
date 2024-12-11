<script lang="ts">
    import type { SteamWishlist } from "$lib/steamapi";
    import WishlistItem from "./WishlistItem.svelte";

    interface Props {
        wishlist?: SteamWishlist
    }

    let { wishlist }: Props = $props();
</script>

<section class="grid grid-cols-1 lg:grid-cols-2 gap-2">
    {#if wishlist}
        {#each wishlist.items as item}
            <WishlistItem item={item} />
        {/each}
    {/if}
</section>