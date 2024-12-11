import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSteamUser } from '$lib/steamapi';

export const GET: RequestHandler = async ({ url }) => {
    const steamId = url.searchParams.get('steamid') ?? null;

    if (!steamId) error(400, 'Steam ID must be specified');

    const steamUser = await getSteamUser(steamId);

    return json(steamUser);
};