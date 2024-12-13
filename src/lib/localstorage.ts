
export const LS_KEY_USER = 'steamUser';
export const LS_KEY_WISHLIST = 'steamWishlist';
export const LS_KEY_WISHLIST_CURRENT_PAGE = 'steamWishlistCurrentPage';
export const LS_KEY_GAME_CATEGORIES = 'steamGameCategories';
export const LS_KEY_GAME_GENRES = 'steamGameGenres';

interface LocalStorageItem {
    created: number,
    expiration: number|null,
    data: string
}

export function setLocalStorageItem(
    key: string, 
    value: {[key: string]: any}|string|number|null, 
    expirationSeconds: number|null = 21600
): void {
    const item: LocalStorageItem = {
        created: Date.now(),
        expiration: expirationSeconds ? expirationSeconds * 1000 : null, // convert to ms
        data: JSON.stringify(value)
    };

    window.localStorage.setItem(key, JSON.stringify(item));
}

export async function getLocalStorageItem(
    key: string, 
    refreshCallback?: () => Promise<{[key: string]: any}|string|number|null>,
    refreshExpirationSeconds: number|null = 216000
): Promise<{[key: string]: any}|string|number|null> {
    const itemString = window.localStorage.getItem(key);

    if (!itemString) return refreshCallback ? await refreshItem(key, refreshCallback, refreshExpirationSeconds) : null;

    const item: LocalStorageItem = JSON.parse(itemString);
    const now = Date.now();

    // Item expired
    if (item.expiration && ((now - item.created) > item.expiration)) {
        if (refreshCallback) {
            return await refreshItem(key, refreshCallback, refreshExpirationSeconds ?? (item.expiration / 1000));
        } else {
            removeLocalStorageItem(key);
            return null;
        }
    }

    return JSON.parse(item.data);
}

export function removeLocalStorageItem(key: string): void {
    window.localStorage.removeItem(key);
}

export function bulkRemoveLocalStorageItems(keys: string[]): void {
    keys.forEach((key) => removeLocalStorageItem(key));
}

async function refreshItem(
    key: string, 
    refreshCallback: () => Promise<{[key: string]: any}|string|number|null>,
    expirationSeconds: number|null
): Promise<{[key: string]: any}|string|number|null> {
    const data = await refreshCallback();
    setLocalStorageItem(key, data, expirationSeconds);
    return data;
}