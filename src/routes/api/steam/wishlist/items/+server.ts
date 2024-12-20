import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWishlistItems } from '$lib/steamapi';

export const GET: RequestHandler = async ({ url }) => {
    const steamId = url.searchParams.get('steamid') ?? null;
    const page = Number(url.searchParams.get('page') ?? 0);

    if (!steamId) error(400, 'Steam ID must be specified');

    const wishlistItems = await getWishlistItems(steamId);

    return json(wishlistItems);
};