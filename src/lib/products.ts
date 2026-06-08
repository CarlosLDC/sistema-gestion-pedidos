import { Product } from '../types';

export function isMedicationProduct(product: Product): boolean {
  return product.productType === 'medicamento' || product.sku.startsWith('RX-');
}
