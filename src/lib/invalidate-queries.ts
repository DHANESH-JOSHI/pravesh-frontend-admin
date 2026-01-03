import { QueryClient } from "@tanstack/react-query";

type MaybeString = string | undefined | null;

/**
 * Product-related invalidation
 * Matches backend: PRODUCT_ANY, PRODUCTS_ALL, PRODUCT_RELATED_ANY, PRODUCT_FILTERS, DASHBOARD_ALL, CATEGORY_ANY, BRAND_ANY
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

  // Invalidate all product list variations (matches: products*)
  queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  
  // Invalidate specific product queries (matches: product:${id}* and product:${slug}*)
  if (productId) {
    queryClient.invalidateQueries({ queryKey: ["product", productId], exact: false });
  }
  if (productSlug) {
    queryClient.invalidateQueries({ queryKey: ["product"], exact: false });
  }
  if (oldSlug && oldSlug !== productSlug) {
    queryClient.invalidateQueries({ queryKey: ["product"], exact: false });
  }
  
  // Invalidate product related queries (matches: product:${id}:related*)
  if (productId) {
    queryClient.invalidateQueries({ queryKey: ["product", productId, "related"], exact: false });
  }
  
  // Invalidate product filters (matches: product_filters)
  queryClient.invalidateQueries({ queryKey: ["product-filters"] });
  
  // Invalidate dashboard stats (matches: dashboard:stats*)
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  
  // Invalidate category caches (affects category productCount) - matches: category:${id}*
  if (categoryId) {
    queryClient.invalidateQueries({ queryKey: ["category", categoryId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  if (oldCategoryId && oldCategoryId !== categoryId) {
    queryClient.invalidateQueries({ queryKey: ["category", oldCategoryId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  if (categoryId || oldCategoryId) {
    queryClient.invalidateQueries({ queryKey: ["categories"], exact: false });
  }
  
  // Invalidate brand caches (affects brand productCount) - matches: brand:${id}*
  if (brandId) {
    queryClient.invalidateQueries({ queryKey: ["brand", brandId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["brand"], exact: false });
  }
  if (oldBrandId && oldBrandId !== brandId) {
    queryClient.invalidateQueries({ queryKey: ["brand", oldBrandId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["brand"], exact: false });
  }
  if (brandId || oldBrandId) {
    queryClient.invalidateQueries({ queryKey: ["brands"], exact: false });
  }
  
  // Invalidate order caches (orders display product info: name, thumbnail, slug in order items)
  queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
  queryClient.invalidateQueries({ queryKey: ["order"], exact: false });
  
  // Invalidate wishlist caches (wishlists display product info: name, thumbnail, slug)
  // Note: Frontend uses Redux for wishlist, but dashboard might have wishlist queries
  queryClient.invalidateQueries({ queryKey: ["wishlist"], exact: false });
}

/**
 * Order-related invalidation
 * Matches backend: ORDER_ANY, ORDERS_BY_USER, ORDERS_ALL, USER_ANY, DASHBOARD_ALL, PRODUCTS_ALL, PRODUCT_ANY/CATEGORY_ANY/BRAND_ANY (on delivered)
 */
export function invalidateOrderQueries(
  queryClient: QueryClient,
  params: {
    orderId?: MaybeString;
    userId?: MaybeString;
    touchesProducts?: boolean;
    productIds?: MaybeString[];
    categoryIds?: MaybeString[];
    brandIds?: MaybeString[];
  } = {}
) {
  const { orderId, userId, touchesProducts, productIds, categoryIds, brandIds } = params;

  // Invalidate specific order (matches: order:${orderId})
  if (orderId) {
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
  }
  
  // Invalidate user-specific orders (matches: orders:user:${userId}*)
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["orders", "user", userId], exact: false });
  }
  
  // Invalidate all order list variations (matches: orders*)
  queryClient.invalidateQueries({ queryKey: ["orders"], exact: false });
  
  // Invalidate user cache (matches: user:${userId}*)
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["user", userId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["user"], exact: false });
  }
  
  // Invalidate dashboard stats (matches: dashboard:stats*)
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  
  // If order touches products (e.g., on create or delivered status), invalidate products (matches: products*)
  if (touchesProducts) {
    queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  }
  
  
  // When order is delivered, invalidate specific product/category/brand caches (affects salesCount, totalSold, counts)
  if (productIds && productIds.length > 0) {
    productIds.forEach((productId) => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId], exact: false });
      }
    });
  }
  if (categoryIds && categoryIds.length > 0) {
    categoryIds.forEach((categoryId) => {
      if (categoryId) {
        queryClient.invalidateQueries({ queryKey: ["category", categoryId], exact: false });
        queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
      }
    });
    queryClient.invalidateQueries({ queryKey: ["categories"], exact: false });
  }
  if (brandIds && brandIds.length > 0) {
    brandIds.forEach((brandId) => {
      if (brandId) {
        queryClient.invalidateQueries({ queryKey: ["brand", brandId], exact: false });
        queryClient.invalidateQueries({ queryKey: ["brand"], exact: false });
      }
    });
    queryClient.invalidateQueries({ queryKey: ["brands"], exact: false });
  }
}

/**
 * Message-related invalidation
 * Matches backend: MESSAGE_BY_ID, MESSAGES_ALL
 */
export function invalidateMessageQueries(
  queryClient: QueryClient,
  messageId?: MaybeString
) {
  // Invalidate specific message (matches: message:${id}*)
  if (messageId) {
    queryClient.invalidateQueries({ queryKey: ["message", messageId], exact: false });
  }
  
  // Invalidate all message list variations (matches: messages*)
  queryClient.invalidateQueries({ queryKey: ["messages"], exact: false });
}

/**
 * Category-related invalidation
 * Matches backend: CATEGORY_ANY, CATEGORIES_ALL, CATEGORY_BY_SLUG_ANY, CATEGORY_TREE, CATEGORY_LEAF, BRAND_ANY, PRODUCTS_ALL
 */
export function invalidateCategoryQueries(
  queryClient: QueryClient,
  params: {
    categoryId?: MaybeString;
    categorySlug?: MaybeString;
    oldSlug?: MaybeString;
    parentCategoryId?: MaybeString;
    oldParentCategoryId?: MaybeString;
    brandIds?: MaybeString[];
  } = {}
) {
  const { categoryId, categorySlug, oldSlug, parentCategoryId, oldParentCategoryId, brandIds } = params;
  
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
  queryClient.invalidateQueries({ queryKey: ["categories-parent"], exact: false });
  queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  
  // Invalidate category tree (matches: categories:tree)
  queryClient.invalidateQueries({ queryKey: ["categories", "tree"] });
  
  // Invalidate category leaf (matches: categories:leaf)
  queryClient.invalidateQueries({ queryKey: ["categories", "leaf"] });
  
  // Invalidate parent category if changed (matches: category:${parentId}*)
  if (parentCategoryId) {
    queryClient.invalidateQueries({ queryKey: ["category", parentCategoryId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  if (oldParentCategoryId && oldParentCategoryId !== parentCategoryId) {
    queryClient.invalidateQueries({ queryKey: ["category", oldParentCategoryId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["category"], exact: false });
  }
  
  // Invalidate brand caches that have this category (affects brand categoryCount) - matches: brand:${id}*
  if (brandIds && brandIds.length > 0) {
    brandIds.forEach((brandId) => {
      if (brandId) {
        queryClient.invalidateQueries({ queryKey: ["brand", brandId], exact: false });
        queryClient.invalidateQueries({ queryKey: ["brand"], exact: false });
      }
    });
    queryClient.invalidateQueries({ queryKey: ["brands"], exact: false });
  }
  
  // Invalidate related products (categories affect products) - matches: products*
  queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
}

/**
 * Brand-related invalidation
 * Matches backend: BRAND_ANY, BRANDS_ALL, BRAND_BY_SLUG_ANY, CATEGORY_ANY, PRODUCTS_ALL
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
  if (allCategoryIds.size > 0) {
    queryClient.invalidateQueries({ queryKey: ["categories"], exact: false });
  }
  
  // Invalidate related products (brands affect products, especially if name changed) - matches: products*
  if (nameChanged) {
    queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  }
  // Always invalidate products when brand changes (backend does this)
  queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
}

/**
 * Blog-related invalidation
 * Matches backend: BLOG_ANY, BLOG_BY_SLUG_ANY, BLOGS_ALL
 */
export function invalidateBlogQueries(
  queryClient: QueryClient,
  params: {
    blogId?: MaybeString;
    slug?: MaybeString;
    oldSlug?: MaybeString;
  } = {}
) {
  const { blogId, slug, oldSlug } = params;
  
  // Invalidate specific blog (matches: blog:${id}*)
  if (blogId) {
    queryClient.invalidateQueries({ queryKey: ["blog", blogId], exact: false });
  }
  
  // Invalidate blog by slug (matches: blog:${slug}*)
  if (slug) {
    queryClient.invalidateQueries({ queryKey: ["blog"], exact: false });
  }
  
  // Invalidate old slug if changed (matches: blog:${oldSlug}*)
  if (oldSlug && oldSlug !== slug) {
    queryClient.invalidateQueries({ queryKey: ["blog"], exact: false });
  }
  
  // Invalidate all blog list variations (matches: blogs*)
  queryClient.invalidateQueries({ queryKey: ["blogs"], exact: false });
}

/**
 * Banner-related invalidation
 * Matches backend: BANNER_ANY, BANNERS_ALL
 */
export function invalidateBannerQueries(
  queryClient: QueryClient,
  bannerId?: MaybeString
) {
  // Invalidate specific banner (matches: banner:${id}*)
  if (bannerId) {
    queryClient.invalidateQueries({ queryKey: ["banner", bannerId], exact: false });
  }
  
  // Invalidate all banner list variations (matches: banners*)
  queryClient.invalidateQueries({ queryKey: ["banners"], exact: false });
}

/**
 * Address-related invalidation
 * Matches backend: ADDRESS_ANY, ADDRESSES_BY_USER, ADDRESSES_ALL, USER_ANY
 */
export function invalidateAddressQueries(
  queryClient: QueryClient,
  params: {
    addressId?: MaybeString;
    userId?: MaybeString;
  } = {}
) {
  const { addressId, userId } = params;
  
  // Invalidate specific address (matches: address:${id}*)
  if (addressId) {
    queryClient.invalidateQueries({ queryKey: ["address", addressId], exact: false });
  }
  
  // Invalidate user-specific addresses (matches: addresses:user:${userId}*)
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["addresses", "user", userId], exact: false });
  }
  
  // Invalidate all address list variations (matches: addresses*)
  queryClient.invalidateQueries({ queryKey: ["addresses"], exact: false });
  
  // Invalidate user cache (matches: user:${userId}*)
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["user", userId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["user"], exact: false });
  }
}

/**
 * Review-related invalidation
 * Matches backend: REVIEW_BY_ID, REVIEWS_BY_PRODUCT, REVIEWS_BY_USER, REVIEWS_ALL, PRODUCT_ANY, USER_ANY
 */
export function invalidateReviewQueries(
  queryClient: QueryClient,
  params: {
    reviewId?: MaybeString;
    productId?: MaybeString;
    userId?: MaybeString;
  } = {}
) {
  const { reviewId, productId, userId } = params;
  
  // Invalidate specific review (matches: review:${id})
  if (reviewId) {
    queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
  }
  
  // Invalidate product-specific reviews (matches: reviews:product:${productId}*)
  if (productId) {
    queryClient.invalidateQueries({ queryKey: ["reviews", "product", productId], exact: false });
    // Also invalidate the product itself (reviews affect product ratings) - matches: product:${productId}*
    queryClient.invalidateQueries({ queryKey: ["product", productId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
  }
  
  // Invalidate user-specific reviews (matches: reviews:user:${userId}*)
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["reviews", "user", userId], exact: false });
    // Also invalidate user cache - matches: user:${userId}*
    queryClient.invalidateQueries({ queryKey: ["user", userId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["user"], exact: false });
  }
  
  // Invalidate all review list variations (matches: reviews:*)
  queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
}



/**
 * Setting-related invalidation
 * Matches backend: SETTINGS_LIST
 */
export function invalidateSettingQueries(
  queryClient: QueryClient,
  params: { key?: MaybeString } = {}
) {
  const { key } = params;
  
  // Invalidate specific setting (matches: setting:${key}*)
  if (key) {
    queryClient.invalidateQueries({ queryKey: ["setting", key], exact: false });
  }
  
  // Invalidate all settings (matches: settings*)
  queryClient.invalidateQueries({ queryKey: ["settings"], exact: false });
}

/**
 * User-related invalidation
 * Matches backend: USER_ANY, USERS_ALL, DASHBOARD_ALL
 */
export function invalidateUserQueries(
  queryClient: QueryClient,
  userId?: MaybeString
) {
  // Invalidate specific user (matches: user:${userId}*)
  if (userId) {
    queryClient.invalidateQueries({ queryKey: ["user", userId], exact: false });
    queryClient.invalidateQueries({ queryKey: ["user"], exact: false });
  }
  
  // Invalidate all user list variations (matches: users*)
  queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
  
  // Invalidate dashboard stats (user changes affect stats) - matches: dashboard:stats*
  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
}

