/**
 * Curated logistics/shipping photography from Unsplash (free to use, no
 * attribution required). Centralized here so every page references the same
 * verified-working URLs with consistent sizing/format params.
 */
function unsplash(id: string, params = "") {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80${params}`;
}

export const STOCK_IMAGES = {
  /** Aerial view of a container port — global shipping. */
  containerPort: unsplash("photo-1494412651409-8963ce7935a7"),
  /** Warehouse aisle with racked pallets. */
  warehouse: unsplash("photo-1553413077-190dd305871c"),
  /** Cargo/delivery truck on the highway. */
  deliveryTruck: unsplash("photo-1601584115197-04ecc0da31d7"),
  /** Airplane wing above the clouds — air freight. */
  airFreight: unsplash("photo-1436491865332-7a61a109cc05"),
  /** Large fulfillment center interior, wide shot — used for the login page. */
  fulfillmentCenter: unsplash("photo-1586528116311-ad8dd3c8310d"),
  /** Sorting/packing facility interior. */
  sortingFacility: unsplash("photo-1577412647305-991150c7d163"),
} as const;
