import { Product, Customer, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'med-1',
    name: 'Ramipril 5mg',
    sku: 'RX-RAM-001',
    category: 'Cardiovascular',
    price: 12.50,
    stock: 120,
    minStock: 20,
    imageColor: 'from-primary to-secondary',
    productType: 'medicamento',
  },
  {
    id: 'med-2',
    name: 'Aspirina 100mg',
    sku: 'RX-ASP-002',
    category: 'Analgesia / Antiagregante',
    price: 6.00,
    stock: 450,
    minStock: 50,
    imageColor: 'from-primary to-primary-600',
    productType: 'medicamento',
  },
  {
    id: 'med-3',
    name: 'Amoxicilina 875mg + Ácido Clavulánico 125mg',
    sku: 'RX-AMO-003',
    category: 'Antibiótico',
    price: 18.20,
    stock: 80,
    minStock: 15,
    imageColor: 'from-secondary to-secondary-600',
    productType: 'medicamento',
  },
  {
    id: 'med-4',
    name: 'Metformina 850mg',
    sku: 'RX-MET-004',
    category: 'Antidiabético',
    price: 9.80,
    stock: 310,
    minStock: 40,
    imageColor: 'from-primary to-secondary',
    productType: 'medicamento',
  },
  {
    id: 'med-5',
    name: 'Atorvastatina 20mg',
    sku: 'RX-ATO-005',
    category: 'Hipolipemiante',
    price: 15.40,
    stock: 150,
    minStock: 25,
    imageColor: 'from-secondary to-secondary-600',
    productType: 'medicamento',
  },
  {
    id: 'med-6',
    name: 'Ibuprofeno 600mg',
    sku: 'RX-IBU-006',
    category: 'Antiinflamatorio',
    price: 4.50,
    stock: 500,
    minStock: 60,
    imageColor: 'from-primary to-primary-600',
    productType: 'medicamento',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+34 612 345 678',
    address: 'Calle de Alcalá 142, 3ºB',
    city: 'Madrid',
    totalOrders: 4,
    totalSpent: 899.95,
  },
  {
    id: 'cust-2',
    name: 'Ana Gómez Román',
    email: 'ana.gomez@email.com',
    phone: '+34 699 888 777',
    address: 'Avenida Diagonal 450, Ático',
    city: 'Barcelona',
    totalOrders: 2,
    totalSpent: 489.98,
  },
  {
    id: 'cust-3',
    name: 'Luis Rodríguez Silva',
    email: 'luis.rod@email.com',
    phone: '+34 600 111 222',
    address: 'Plaza Mayor 5, Bajo C',
    city: 'Salamanca',
    totalOrders: 1,
    totalSpent: 129.99,
  },
  {
    id: 'cust-4',
    name: 'Sofía Peralta Vega',
    email: 'sofia.peralta@email.com',
    phone: '+34 677 333 444',
    address: 'Paseo de la Castellana 210',
    city: 'Madrid',
    totalOrders: 3,
    totalSpent: 1145.92,
  },
  {
    id: 'cust-5',
    name: 'David Ortiz Alarcón',
    email: 'david.ortiz@email.com',
    phone: '+34 655 444 333',
    address: 'Calle Betis 12, 1ºA',
    city: 'Sevilla',
    totalOrders: 0,
    totalSpent: 0,
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'PED-1001',
    customerId: 'cust-1',
    customerName: 'Carlos Mendoza',
    customerEmail: 'carlos.mendoza@email.com',
    items: [
      {
        productId: 'med-1',
        productName: 'Ramipril 5mg',
        price: 12.50,
        quantity: 2,
      },
      {
        productId: 'med-2',
        productName: 'Aspirina 100mg',
        price: 6.00,
        quantity: 1,
      }
    ],
    subtotal: 31.00,
    tax: 6.51,
    discount: 0,
    total: 37.51,
    status: 'Entregado',
    paymentMethod: 'Tarjeta',
    shippingAddress: 'Calle de Alcalá 142, 3ºB, Madrid',
    createdAt: '2026-06-01T10:30:00Z',
    history: [
      { status: 'Pendiente', timestamp: '2026-06-01T10:30:00Z', note: 'Pedido recibido a través de la web.' },
      { status: 'En Preparación', timestamp: '2026-06-01T14:15:00Z', note: 'Embalaje y preparación de los medicamentos.' },
      { status: 'Enviado', timestamp: '2026-06-02T09:00:00Z', note: 'Enviado por mensajería farmacéutica. Seguimiento: #FAR98234.' },
      { status: 'Entregado', timestamp: '2026-06-03T12:45:00Z', note: 'Entregado al paciente.' }
    ]
  },
  {
    id: 'PED-1002',
    customerId: 'cust-4',
    customerName: 'Sofía Peralta Vega',
    customerEmail: 'sofia.peralta@email.com',
    items: [
      {
        productId: 'med-4',
        productName: 'Metformina 850mg',
        price: 9.80,
        quantity: 2,
      },
      {
        productId: 'med-5',
        productName: 'Atorvastatina 20mg',
        price: 15.40,
        quantity: 1,
      }
    ],
    subtotal: 35.00,
    tax: 7.35,
    discount: 5.00,
    total: 37.35,
    status: 'Enviado',
    paymentMethod: 'Transferencia',
    shippingAddress: 'Paseo de la Castellana 210, Madrid',
    createdAt: '2026-06-05T08:20:00Z',
    history: [
      { status: 'Pendiente', timestamp: '2026-06-05T08:20:00Z', note: 'Esperando confirmación de transferencia bancaria.' },
      { status: 'En Preparación', timestamp: '2026-06-05T11:00:00Z', note: 'Transferencia verificada. Pedido en farmacia.' },
      { status: 'Enviado', timestamp: '2026-06-06T15:30:00Z', note: 'Listo para retiro en sucursal Farmahumana.' }
    ]
  },
  {
    id: 'PED-1003',
    customerId: 'cust-2',
    customerName: 'Ana Gómez Román',
    customerEmail: 'ana.gomez@email.com',
    items: [
      {
        productId: 'med-3',
        productName: 'Amoxicilina 875mg + Ácido Clavulánico 125mg',
        price: 18.20,
        quantity: 1,
      },
      {
        productId: 'med-6',
        productName: 'Ibuprofeno 600mg',
        price: 4.50,
        quantity: 2,
      }
    ],
    subtotal: 27.20,
    tax: 5.71,
    discount: 2.00,
    total: 30.91,
    status: 'En Preparación',
    paymentMethod: 'Tarjeta',
    shippingAddress: 'Avenida Diagonal 450, Ático, Barcelona',
    createdAt: '2026-06-07T14:45:00Z',
    history: [
      { status: 'Pendiente', timestamp: '2026-06-07T14:45:00Z', note: 'Pago aprobado mediante pasarela externa.' },
      { status: 'En Preparación', timestamp: '2026-06-07T17:00:00Z', note: 'Medicamentos en preparación en almacén.' }
    ]
  },
  {
    id: 'PED-1004',
    customerId: 'cust-3',
    customerName: 'Luis Rodríguez Silva',
    customerEmail: 'luis.rod@email.com',
    items: [
      {
        productId: 'med-2',
        productName: 'Aspirina 100mg',
        price: 6.00,
        quantity: 3,
      }
    ],
    subtotal: 18.00,
    tax: 3.78,
    discount: 0,
    total: 21.78,
    status: 'Pendiente',
    paymentMethod: 'Efectivo',
    shippingAddress: 'Plaza Mayor 5, Bajo C, Salamanca',
    createdAt: '2026-06-07T22:10:00Z',
    history: [
      { status: 'Pendiente', timestamp: '2026-06-07T22:10:00Z', note: 'Pedido registrado pendiente de pago.' }
    ]
  }
];
