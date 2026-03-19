export interface Product {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const products: Product[] = [
  {
    id: 'prod_TPTLZZlcYFYUWE',
    priceId: 'price_1SSeP4AXwFNn2F2ig7otD7p7',
    name: 'Vektrus AI (Monatlich)',
    description: 'Vollzugriff auf alle Vektrus AI Features für einen Monat',
    mode: 'subscription',
    price: 99.00,
    currency: 'EUR'
  }
];

export const getProductByPriceId = (priceId: string): Product | undefined => {
  return products.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};