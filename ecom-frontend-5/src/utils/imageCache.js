const imageUrlCache = new Map();

export const getCachedImageUrl = (productId) => imageUrlCache.get(productId);

export const setCachedImageUrl = (productId, imageUrl) => {
  imageUrlCache.set(productId, imageUrl);
};
