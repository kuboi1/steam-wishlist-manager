
export const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

export const formatPrice = (price: number, currency: string) => `${price.toFixed(2)}${currency}`;