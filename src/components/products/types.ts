export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  image1_url: string;
  image2_url: string;
  product_url: string;
  rating: number;
  number_of_buys: number;
  stock: number;
}

export interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  searchQuery: string;
  priceRange: {
    min: number;
    max: number;
  };
  showInStock: boolean;
  sortBy: string;
}
