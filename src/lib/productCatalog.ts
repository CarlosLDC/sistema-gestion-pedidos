import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

export const PRODUCTS_DATA_VERSION = 2;

export const PHARMACY_CATEGORIES = [
  ...new Set([
    ...INITIAL_PRODUCTS.map((product) => product.category),
    'Farmacia General',
  ]),
] as const;

export const DEFAULT_PHARMACY_CATEGORY = PHARMACY_CATEGORIES[0];

const LEGACY_CATEGORIES = new Set([
  'Tecnología',
  'Audio',
  'Oficina',
  'Hogar',
  'Electrónica',
  'General',
]);

function hasLegacyCatalog(products: Product[]): boolean {
  return products.some(
    (product) =>
      LEGACY_CATEGORIES.has(product.category) ||
      product.productType !== 'medicamento' ||
      !product.id.startsWith('med-')
  );
}

export function shouldRefreshProductsStorage(
  storedVersion: number | null,
  products: Product[] | null
): boolean {
  if (storedVersion === null || storedVersion < PRODUCTS_DATA_VERSION) {
    return true;
  }
  if (!products?.length) {
    return true;
  }
  return hasLegacyCatalog(products);
}

export function loadProductsFromStorage(raw: string | null): Product[] {
  if (!raw) {
    return INITIAL_PRODUCTS;
  }

  try {
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}
