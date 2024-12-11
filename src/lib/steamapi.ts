import axios from "axios";
import { STEAM_API_KEY } from '$env/static/private';


const STEAM_API_USER_URL = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v1';
const STEAM_API_GAME_URL = 'https://store.steampowered.com/api/appdetails';
const STEAM_API_WISHLIST_URL = 'https://api.steampowered.com/IWishlistService/GetWishlist/v1';


export interface SteamUser {
    id: string,
    username: string,
    avatarUrl: string
}

export interface SteamGame {
    id: string,
    type: string,
    name: string,
    isFree: boolean,
    shortDescription: string,
    headerImageUrl: string,
    capsuleImageUrl: string,
    developers: string[],
    publishers: string[],
    categories: SteamGameCategory[],
    genres: SteamGameGenre[],
    price?: SteamGamePrice
}

interface SteamGameCategory {
    id: string,
    name: string
}

interface SteamGameGenre {
    id: string,
    name: string
}

interface SteamGamePrice {
    initial: string,
    final: string,
    discountPercent: number
}

interface SteamGameReleaseDate {
    comingSoon: boolean,
    date: string
}

export interface SteamWishlist {
    steamId: string,
    items: SteamWishlistItem[]
}

export interface SteamWishlistItem {
    game: SteamGame,
    dateAdded: Date
}

interface WishlistResponseItem {
    appid: number,
    date_added: number
}

interface GameResponseItem {
    success: string,
    data: { [key: string]: any }
}


export async function getSteamUser(steamId: string): Promise<SteamUser|null> {
    const response = await axios.get(
        STEAM_API_USER_URL, 
        {
            params: {
                key: STEAM_API_KEY,
                steamids: steamId
            }
        }
    );

    if (response.status !== 200) return null;

    const playerResult = response.data.response.players.player;

    if (playerResult.length === 0) return null;

    const player = playerResult[0];

    return {
        id: player.steamid,
        username: player.personaname,
        avatarUrl: player.avatarfull
    };
}

export async function getWishlist(steamId: string, pageNum: number, itemsPerPage = 20): Promise<SteamWishlist|null> {
    const response = await axios.get(
        STEAM_API_WISHLIST_URL, 
        {
            params: {
                steamid: steamId
            }
        }
    );

    if (response.status !== 200) return null;

    let wishlistItems: WishlistResponseItem[] = response.data.response.items;
    wishlistItems = wishlistItems.slice(pageNum * itemsPerPage, (pageNum * itemsPerPage) + itemsPerPage);

    const items: SteamWishlistItem[] = [];

    for (const item of wishlistItems) {
        const game = await getSteamGame(item.appid);
        if (game) {
            items.push({ game, dateAdded: new Date(item.date_added * 1000)});
        }
    }

    return { steamId, items };
}

export async function getSteamGame(appId: number): Promise<SteamGame|null> {
    const response = await axios.get(
        STEAM_API_GAME_URL, 
        {
            params: {
                appids: appId,
                cc: 'eur' // EUR currency
            }
        }
    );

    if (response.status !== 200 || Object.values(response.data).length === 0) return null;

    const game = (Object.values(response.data)[0] as GameResponseItem).data;
    
    if (!game) return null;

    return {
        id: game.steam_appid,
        type: game.type,
        name: game.name,
        isFree: game.is_free,
        shortDescription: game.short_description,
        headerImageUrl: game.header_image,
        capsuleImageUrl: game.capsule_image,
        developers: game.developers,
        publishers: game.publishers,
        categories: game.categories,
        genres: game.genres,
        price: game.price_overview ? {
            initial: game.price_overview.initial_formatted,
            final: game.price_overview.final_formatted,
            discountPercent: game.price_overview.discount_percent,
        } : undefined
    };
}