import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSteamGame, getSteamUser } from '$lib/steamapi';

export const GET: RequestHandler = async ({ url }) => {
    const appId = url.searchParams.get('appid') ?? null;

    if (!appId) error(400, 'App ID must be specified');

    if (isNaN(Number(appId))) error(400, 'App ID must be a number');

    const game = await getSteamGame(Number(appId));

    return json(game);
};