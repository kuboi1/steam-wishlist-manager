import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWishlist } from '$lib/steamapi';

export const GET: RequestHandler = async ({ url }) => {
    const steamId = url.searchParams.get('steamid') ?? null;
    const page = Number(url.searchParams.get('page') ?? 0);
    const perPage = Number(url.searchParams.get('perPage') ?? 200);
    const excludeIdsParam = url.searchParams.get('excludeids') ?? '';
    
    if (!steamId) error(400, 'Steam ID must be specified');

    const excludeIds = excludeIdsParam.split(',');

    const wishlist = await getWishlist(steamId, page, perPage, excludeIds);

    return json(wishlist);
};