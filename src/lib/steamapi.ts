import axios from "axios";
import { STEAM_API_KEY } from '$env/static/private';


const STEAM_API_USER_URL = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v1';
const STEAM_API_GAME_URL = 'https://store.steampowered.com/api/appdetails';
const STEAM_API_WISHLIST_URL = 'https://api.steampowered.com/IWishlistService/GetWishlist/v1';
const STEAM_API_REVIEWS_URL = 'https://store.steampowered.com/appreviews';


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
    releaseDate: SteamGameReleaseDate,
    shortDescription: string,
    headerImageUrl: string,
    capsuleImageUrl: string,
    bgImage: string,
    developers: string[],
    publishers: string[],
    categories: SteamGameCategory[],
    genres: SteamGameGenre[],
    reviews?: SteamGameReviews,
    price?: SteamGamePrice
}

export interface SteamGameCategory {
    id: string,
    description: string
}

export interface SteamGameGenre {
    id: string,
    description: string
}

interface SteamGamePrice {
    initial: number,
    final: number,
    discountPercent: number,
    currency: string
}

interface SteamGameReleaseDate {
    comingSoon: boolean,
    date: string
}

interface SteamGameReviews {
    total: number,
    positive: number,
    negative: number,
    score: number,
    label: string
}

export interface SteamWishlist {
    steamId: string,
    items: SteamWishlistItem[],
    pageCount: number
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

export async function getWishlist(
    steamId: string, 
    pageNum: number, 
    itemsPerPage: number,
    excludeIds: string[]
): Promise<SteamWishlist|null> {
    let wishlistItems = await getWishlistItems(steamId);

    if (!wishlistItems) return null;

    const pageCount = Math.round(wishlistItems.length / itemsPerPage);

    wishlistItems = wishlistItems.slice(pageNum * itemsPerPage, (pageNum * itemsPerPage) + itemsPerPage);

    const items: SteamWishlistItem[] = [];

    for (const item of wishlistItems) {
        if (excludeIds.includes(String(item.appid))) continue;

        const game = await getSteamGame(item.appid);

        if (game === 429) break;

        if (game && (typeof game !== 'number')) {
            items.push({ game: game, dateAdded: new Date(item.date_added * 1000)});
        }
    }

    return { steamId, items, pageCount };
}

export async function getWishlistItems(steamId: string): Promise<WishlistResponseItem[]|null> {
    const response = await axios.get(
        STEAM_API_WISHLIST_URL, 
        {
            params: {
                steamid: steamId
            }
        }
    );

    if (response.status !== 200) return null;

    return response.data.response.items as WishlistResponseItem[];
}

export async function getSteamGame(appId: number): Promise<SteamGame|null|number> {
    const gameResponse = await axios.get(
        STEAM_API_GAME_URL, 
        {
            params: {
                appids: appId,
                cc: 'eur' // EUR currency
            }
        }
    );

    if (gameResponse.status === 429) return 429;

    if (gameResponse.status !== 200 || Object.values(gameResponse.data).length === 0) return null;

    const game = (Object.values(gameResponse.data)[0] as GameResponseItem).data;
    
    if (!game) return null;

    // Fetch reviews
    const reviewsResponse = await axios.get(
        `${STEAM_API_REVIEWS_URL}/${appId}`, 
        {
            params: {
                json: 1,
                use_review_quality: 1,
                language: 'all',
                review_type: 'all',
                purchase_type: 'all',
                playtime_type: 'all'
            }
        }
    );
    const reviewsData = reviewsResponse.data.query_summary;

    let reviews: SteamGameReviews|undefined = undefined;

    if (reviewsResponse.status === 200 && reviewsData) {
        reviews = {
            total: reviewsData.total_reviews,
            positive: reviewsData.total_positive,
            negative: reviewsData.total_negative,
            score: reviewsData.total_positive / reviewsData.total_reviews,
            label: reviewsData.review_score_desc
        };
    }

    return {
        id: game.steam_appid,
        type: game.type,
        name: game.name,
        isFree: game.is_free,
        releaseDate: {
            comingSoon: game.release_date.coming_soon,
            date: game.release_date.date
        },
        shortDescription: game.short_description,
        headerImageUrl: game.header_image,
        capsuleImageUrl: game.capsule_image,
        bgImage: (game.screenshots && game.screenshots.length > 0) ? game.screenshots[0].path_full : game.capsule_image,
        developers: game.developers,
        publishers: game.publishers,
        categories: game.categories,
        genres: game.genres,
        reviews: reviews,
        price: game.price_overview ? {
            initial: game.price_overview.initial / 100,
            final: game.price_overview.final / 100,
            discountPercent: game.price_overview.discount_percent,
            currency: '€' // Maybe currency select in the future
        } : undefined
    };
}