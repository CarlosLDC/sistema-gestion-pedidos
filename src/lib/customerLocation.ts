import { Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../data/mockData';

export const CUSTOMERS_DATA_VERSION = 2;

const SEED_CUSTOMER_BY_ID = Object.fromEntries(
  INITIAL_CUSTOMERS.map((customer) => [customer.id, customer])
);

const SPANISH_CITIES = new Set([
  'Madrid',
  'Barcelona',
  'Salamanca',
  'Sevilla',
  'Bilbao',
  'Málaga',
  'Zaragoza',
  'Murcia',
]);

const SPANISH_ADDRESS_PATTERN =
  /Calle de|º[A-Z]|Ático|Avenida Diagonal|Paseo de la Castellana|Plaza Mayor|Bajo C|Calle Betis/i;

export function formatCustomerLocation(customer: Pick<Customer, 'municipio' | 'state'>) {
  return `${customer.municipio}, ${customer.state}`;
}

export function formatCustomerAddress(customer: Pick<Customer, 'address' | 'municipio' | 'state'>) {
  return `${customer.address} — ${formatCustomerLocation(customer)}`;
}

export function isLegacyCustomer(raw: Customer & { city?: string }): boolean {
  const legacyCity = raw.city ?? '';
  const municipio = raw.municipio ?? '';
  const state = raw.state ?? '';

  if (raw.phone?.includes('+34')) return true;
  if (legacyCity && !state) return true;
  if (SPANISH_CITIES.has(legacyCity)) return true;
  if (SPANISH_CITIES.has(municipio) && !state) return true;
  if (SPANISH_ADDRESS_PATTERN.test(raw.address ?? '')) return true;
  if (!state || !municipio) return true;

  return false;
}

/** Migra registros antiguos (formato español o campo `city`) al esquema venezolano. */
export function migrateCustomer(raw: Customer & { city?: string }): Customer {
  const legacy = isLegacyCustomer(raw);
  const seed = SEED_CUSTOMER_BY_ID[raw.id];

  if (legacy && seed) {
    return {
      ...seed,
      totalOrders: raw.totalOrders ?? seed.totalOrders,
      totalSpent: raw.totalSpent ?? seed.totalSpent,
    };
  }

  const municipio = raw.municipio ?? raw.city ?? '';
  const state = raw.state ?? '';
  let phone = raw.phone ?? '';
  let address = raw.address ?? '';

  if (legacy) {
    if (phone.includes('+34')) {
      phone = '0412-0000000';
    }
    if (SPANISH_ADDRESS_PATTERN.test(address)) {
      address = 'Av. Principal, Urb. Centro, Edif. Residencial, Piso 1';
    }
  }

  const { city: _city, ...rest } = raw;

  return {
    ...rest,
    address,
    phone,
    municipio: legacy && !state ? 'Libertador' : municipio,
    state: legacy && !state ? 'Distrito Capital' : state,
  };
}

export function loadCustomersFromStorage(stored: string | null): Customer[] {
  if (!stored) {
    return INITIAL_CUSTOMERS;
  }

  const parsed = JSON.parse(stored) as (Customer & { city?: string })[];
  return parsed.map(migrateCustomer);
}

export function shouldRefreshCustomersStorage(storedVersion: number | null): boolean {
  return storedVersion === null || storedVersion < CUSTOMERS_DATA_VERSION;
}
