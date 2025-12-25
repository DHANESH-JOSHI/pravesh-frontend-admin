/**
 * Formats MongoDB Object IDs into user-friendly display formats
 * for non-technical admins
 */

type IdType = "order" | "user" | "product" | "address" | "cart" | "blog" | "banner" | "category" | "brand" | "generic";

const ID_PREFIXES: Record<IdType, string> = {
  order: "ORD",
  user: "USR",
  product: "PRD",
  address: "ADD",
  cart: "CRT",
  blog: "BLG",
  banner: "BNR",
  category: "CAT",
  brand: "BRD",
  generic: "ID",
};

/**
 * Formats an Object ID into a user-friendly format
 * @param id - The Object ID string
 * @param type - The type of ID (order, user, product, etc.)
 * @param options - Formatting options
 * @returns Formatted ID string (e.g., "ORD-12345678")
 */
export function formatId(
  id: string | undefined | null,
  type: IdType = "generic",
  options?: {
    prefix?: string;
    showPrefix?: boolean;
    length?: number;
    fallback?: string;
  }
): string {
  if (!id) {
    return options?.fallback || "N/A";
  }

  const prefix = options?.prefix || ID_PREFIXES[type];
  const showPrefix = options?.showPrefix !== false;
  const length = options?.length || 8;
  
  // Extract last N characters from the ID
  const shortId = String(id).slice(-length);
  
  if (showPrefix) {
    return `${prefix}-${shortId.toUpperCase()}`;
  }
  
  return shortId.toUpperCase();
}

/**
 * Formats an order ID
 */
export function formatOrderId(id: string | undefined | null, options?: Parameters<typeof formatId>[2]): string {
  return formatId(id, "order", options);
}

/**
 * Formats a user ID
 */
export function formatUserId(id: string | undefined | null, options?: Parameters<typeof formatId>[2]): string {
  return formatId(id, "user", options);
}

/**
 * Formats a product ID
 */
export function formatProductId(id: string | undefined | null, options?: Parameters<typeof formatId>[2]): string {
  return formatId(id, "product", options);
}

/**
 * Formats an address ID
 */
export function formatAddressId(id: string | undefined | null, options?: Parameters<typeof formatId>[2]): string {
  return formatId(id, "address", options);
}

