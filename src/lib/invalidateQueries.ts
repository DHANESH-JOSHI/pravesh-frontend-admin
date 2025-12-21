import { QueryClient } from "@tanstack/react-query";

type MaybeString = string | undefined | null;

/**
 * Product-related invalidation
 * Matches backend: PRODUCT_ANY, PRODUCTS_ALL, PRODUCT_RELATED_ANY, PRODUCT_FILTERS
 */
export function invalidateProductQueries(
  queryClient: QueryClient,
  params: {
    productId?: MaybeString;
    productSlug?: MaybeString;
    oldSlug?: MaybeString;
    categoryId?: MaybeString;
    brandId?: MaybeString;
    oldCategoryId?: MaybeString;
    oldBrandId?: MaybeString;
  } = {}
) {
  const { productId, productSlug, oldSlug, categoryId, brandId, oldCategoryId, oldBrandId } = params;

  // Invalidate all product list variations
  queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  
  // Invalidate specific product queries
  if (productId) {
    queryClient.invalidateQueries({ queryKey: ["product", productId], exact: false });
  }
  if (productSlug) {
    queryClient.invalidateQueries({ queryKey: ["product"], exact: false });
  }
  
  // Invalidate product filters
  queryClient.invalidateQueries({ queryKey: ["product-filters"] });
  
  // Invalidate related entity caches
  if (categoryId) {
    queryClient.invalidateQueries({ queryKey: ["category", categoryId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  if (brandId) {
    queryClient.invalidateQueries({ queryKey: ["brand", brandId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["brand"], exact: false });
  }
  
  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

/**
 * Order-related invalidation
 * Matches backend: ORDER_ANY, ORDERS_BY_USER, ORDERS_ALL, PRODUCTS_ALL, WALLET_BY_USER_ANY
 */
export function invalidateOrderQueries(
  queryClient: QueryClient,
  params: {
    orderId?: MaybeString;
    userId?: MaybeString;
    touchesProducts?: boolean;
    touchesWallet?: boolean;
  } = {}
) {
  const { orderId, userId, touchesProducts, touchesWallet } = params;

  // Invalidate specific order (matches: order:${orderId})
  if (orderId) {
    queryClient.invalidateQueries({ queryKey: ["order", orderId], exact: false });
  }
  
  // Invalidate user-specific orders (matches: orders:user:${userId}*)
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
  }
  
  // Invalidate all order list variations (matches: orders*)
  queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
  
  // If order touches products (e.g., stock changes), invalidate products (matches: products*)
  if (touchesProducts) {
    queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  }
  
  // If order touches wallet, invalidate wallet (matches: wallet:user:${userId}*)
  if (touchesWallet && userId) {
    queryClient.invalidateQueries({ queryKey: ["wallet", userId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["wallet"], exact: false });
  }
  
  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

/**
 * Message-related invalidation
 * Matches backend: invalidateMessageCaches
 */
export function invalidateMessageQueries(
  queryClient: QueryClient,
  messageId?: MaybeString
) {
  // Invalidate specific message
  if (messageId) {
    queryClient.invalidateQueries({ queryKey: ["message", messageId], exact: false });
  }
  
  // Invalidate all message list variations
  queryClient.invalidateQueries({ queryKey: ["messages"], exact: false });
}

/**
 * Category-related invalidation
 * Matches backend: CATEGORY_ANY, CATEGORIES_ALL, CATEGORY_BY_SLUG_ANY, CATEGORY_TREE, CATEGORY_LEAF
 */
export function invalidateCategoryQueries(
  queryClient: QueryClient,
  params: {
    categoryId?: MaybeString;
    categorySlug?: MaybeString;
    oldSlug?: MaybeString;
    parentCategoryId?: MaybeString;
    oldParentCategoryId?: MaybeString;
  } = {}
) {
  const { categoryId, categorySlug, oldSlug, parentCategoryId, oldParentCategoryId } = params;
  
  // Invalidate specific category by ID (matches: category:${id}*)
  if (categoryId) {
    queryClient.invalidateQueries({ queryKey: ["category", categoryId], exact: false });
  }
  
  // Invalidate category by slug (matches: category:${slug}*)
  if (categorySlug) {
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  
  // Invalidate old slug if changed (matches: category:${oldSlug}*)
  if (oldSlug && oldSlug !== categorySlug) {
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  
  // Invalidate all category list variations (matches: categories*)
  queryClient.invalidateQueries({ queryKey: ["categories"], exact: false });
  queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  
  // Invalidate category tree (matches: categories:tree)
  queryClient.invalidateQueries({ queryKey: ["categories", "tree"] });
  
  // Invalidate parent category if changed (matches: category:${parentId}*)
  if (parentCategoryId) {
    queryClient.invalidateQueries({ queryKey: ["category", parentCategoryId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  if (oldParentCategoryId && oldParentCategoryId !== parentCategoryId) {
    queryClient.invalidateQueries({ queryKey: ["category", oldParentCategoryId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  
  // Invalidate related products (categories affect products)
  queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  
  // Invalidate related brands (categories affect brands)
  queryClient.invalidateQueries({ queryKey: ["brands"], exact: false });
  
  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

/**
 * Brand-related invalidation
 * Matches backend: BRAND_ANY, BRANDS_ALL, BRAND_BY_SLUG_ANY
 */
export function invalidateBrandQueries(
  queryClient: QueryClient,
  params: {
    brandId?: MaybeString;
    brandSlug?: MaybeString;
    oldSlug?: MaybeString;
    categoryIds?: MaybeString[];
    oldCategoryIds?: MaybeString[];
    nameChanged?: boolean;
  } = {}
) {
  const { brandId, brandSlug, oldSlug, categoryIds, oldCategoryIds, nameChanged } = params;
  
  // Invalidate specific brand by ID (matches: brand:${id}*)
  if (brandId) {
    queryClient.invalidateQueries({ queryKey: ["brand", brandId], exact: false });
  }
  
  // Invalidate brand by slug (matches: brand:${slug}*)
  if (brandSlug) {
    queryClient.invalidateQueries({ queryKey: ["brand"], exact: false });
  }
  
  // Invalidate old slug if changed (matches: brand:${oldSlug}*)
  if (oldSlug && oldSlug !== brandSlug) {
    queryClient.invalidateQueries({ queryKey: ["brand"], exact: false });
  }
  
  // Invalidate all brand list variations (matches: brands*)
  queryClient.invalidateQueries({ queryKey: ["brands"], exact: false });
  queryClient.invalidateQueries({ queryKey: ["brand"], exact: false });
  
  // Invalidate affected categories (matches: category:${categoryId}*)
  const allCategoryIds = new Set([...(categoryIds || []), ...(oldCategoryIds || [])]);
  allCategoryIds.forEach((categoryId) => {
    if (categoryId) {
      queryClient.invalidateQueries({ queryKey: ["category", categoryId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
    }
  });
  
  // Invalidate related products (brands affect products, especially if name changed)
  if (nameChanged) {
    queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  }
  queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  
  // Invalidate dashboard stats
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

/**
 * Blog-related invalidation
 * Matches backend: invalidateBlogCaches
 */
export function invalidateBlogQueries(
  queryClient: QueryClient,
  params: {
    blogId?: MaybeString;
    slug?: MaybeString;
  }
) {
  const { blogId, slug } = params || {};
  
  // Invalidate specific blog
  if (blogId) {
    queryClient.invalidateQueries({ queryKey: ["blog", blogId], exact: false });
  }
  if (slug) {
    queryClient.invalidateQueries({ queryKey: ["blog"], exact: false });
  }
  
  // Invalidate all blog list variations
  queryClient.invalidateQueries({ queryKey: ["blogs"], exact: false });
}

/**
 * Banner-related invalidation
 * Matches backend: invalidateBannerCaches
 */
export function invalidateBannerQueries(
  queryClient: QueryClient,
  bannerId?: MaybeString
) {
  // Invalidate specific banner
  if (bannerId) {
    queryClient.invalidateQueries({ queryKey: ["banner", bannerId], exact: false });
  }
  
  // Invalidate all banner list variations
  queryClient.invalidateQueries({ queryKey: ["banners"], exact: false });
}

/**
 * Address-related invalidation
 * Matches backend: invalidateAddressCaches
 */
export function invalidateAddressQueries(
  queryClient: QueryClient,
  params: {
    addressId?: MaybeString;
    userId?: MaybeString;
  }
) {
  const { addressId, userId } = params || {};
  
  // Invalidate specific address
  if (addressId) {
    queryClient.invalidateQueries({ queryKey: ["address", addressId], exact: false });
  }
  
  // Invalidate user-specific addresses
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["addresses"], exact: false });
    queryClient.invalidateQueries({ queryKey: ["user", userId], exact: false });
  }
  
  // Invalidate all address list variations
  queryClient.invalidateQueries({ queryKey: ["addresses"], exact: false });
}

/**
 * Review-related invalidation
 * Matches backend: invalidateReviewCaches
 */
export function invalidateReviewQueries(
  queryClient: QueryClient,
  params: {
    reviewId?: MaybeString;
    productId?: MaybeString;
    userId?: MaybeString;
  }
) {
  const { reviewId, productId, userId } = params || {};
  
  // Invalidate specific review
  if (reviewId) {
    queryClient.invalidateQueries({ queryKey: ["review", reviewId], exact: false });
  }
  
  // Invalidate product-specific reviews
  if (productId) {
    queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
    // Also invalidate the product itself (reviews affect product ratings)
    queryClient.invalidateQueries({ queryKey: ["product", productId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  }
  
  // Invalidate user-specific reviews
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
  }
  
  // Invalidate all review list variations
  queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
}

/**
 * Cart-related invalidation
 * Matches backend: invalidateCartCaches
 */
export function invalidateCartQueries(
  queryClient: QueryClient,
  params: {
    cartId?: MaybeString;
    userId?: MaybeString;
  }
) {
  const { cartId, userId } = params || {};
  
  // Invalidate specific cart
  if (cartId) {
    queryClient.invalidateQueries({ queryKey: ["cart", cartId], exact: false });
  }
  
  // Invalidate user-specific carts
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["cart"], exact: false });
  }
  
  // Invalidate all cart list variations
  queryClient.invalidateQueries({ queryKey: ["carts"], exact: false });
}

/**
 * Wallet-related invalidation
 * Matches backend: invalidateWalletCaches
 */
export function invalidateWalletQueries(
  queryClient: QueryClient,
  userId?: MaybeString
) {
  // Invalidate user-specific wallet
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["wallet", userId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["wallet"], exact: false });
  }
  
  // Invalidate all wallet list variations
  queryClient.invalidateQueries({ queryKey: ["wallets"], exact: false });
}

/**
 * Setting-related invalidation
 * Matches backend: invalidateSettingCaches
 */
export function invalidateSettingQueries(
  queryClient: QueryClient,
  params: { key?: MaybeString } = {}
) {
  const { key } = params;
  
  // Invalidate specific setting
  if (key) {
    queryClient.invalidateQueries({ queryKey: ["setting", key], exact: false });
  }
  
  // Invalidate all settings
  queryClient.invalidateQueries({ queryKey: ["settings"], exact: false });
}

/**
 * User-related invalidation
 * Matches backend: invalidateUserCaches
 */
export function invalidateUserQueries(
  queryClient: QueryClient,
  userId?: MaybeString
) {
  // Invalidate specific user
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["user", userId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["user"], exact: false });
  }
  
  // Invalidate all user list variations
  queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
  
  // Invalidate dashboard stats (user changes affect stats)
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

/**
 * Wishlist-related invalidation
 * Matches backend: invalidateWishlistCaches
 */
export function invalidateWishlistQueries(
  queryClient: QueryClient,
  userId?: MaybeString
) {
  // Invalidate user-specific wishlist
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["wishlist", userId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["wishlist"], exact: false });
  }
}

