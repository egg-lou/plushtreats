import { component$, useSignal, useStore, $, useTask$ } from '@builder.io/qwik';
import productData from '../../data/product_details.json';

interface Product {
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

interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  searchQuery: string;
  priceRange: {
    min: number;
    max: number;
  };
  selectedCategories: string[];
  sortBy: string;
}

const ProductSection = component$(() => {
  const showModal = useSignal(false);
  const selectedProduct = useSignal<Product | null>(null);
  
  const store = useStore<ProductStore>({
    products: productData as Product[],
    filteredProducts: productData as Product[],
    searchQuery: '',
    priceRange: {
      min: 0,
      max: 1000,
    },
    selectedCategories: [],
    sortBy: 'popularity'
  });

  const handleSearch = $((query: string) => {
    store.searchQuery = query;
  });

  // Use useTask$ to watch for changes and update filtered products
  useTask$(({ track }) => {
    track(() => store.searchQuery);
    track(() => store.priceRange.min);
    track(() => store.priceRange.max);
    track(() => store.selectedCategories);
    track(() => store.sortBy);

    let filtered = store.products;

    // Search filter
    if (store.searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(store.searchQuery.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= store.priceRange.min && price <= store.priceRange.max;
    });

    // Category filter
    if (store.selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        store.selectedCategories.includes(product.name.split(' ')[0])
      );
    }

    // Sorting
    switch (store.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'popularity':
        filtered.sort((a, b) => b.number_of_buys - a.number_of_buys);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    store.filteredProducts = filtered;
  });

  const addToCart = $((product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
  });

  return (
    <div class="min-h-screen w-full px-6" id="shop my-10">
      {/* Search and Filters Section */}
      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          class="input input-bordered w-full md:w-1/3"
          onInput$={(e) => handleSearch((e.target as HTMLInputElement).value)}
        />
        
        <select 
          class="select select-bordered"
          onChange$={(e) => {
            store.sortBy = (e.target as HTMLSelectElement).value;
          }}
        >
          <option value="popularity">Sort by Popularity</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Price Range</span>
          </label>
          <div class="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              class="input input-bordered w-24"
              value={store.priceRange.min}
              onChange$={(e) => {
                store.priceRange.min = parseInt((e.target as HTMLInputElement).value);
              }}
            />
            <input
              type="number"
              placeholder="Max"
              class="input input-bordered w-24"
              value={store.priceRange.max}
              onChange$={(e) => {
                store.priceRange.max = parseInt((e.target as HTMLInputElement).value);
              }}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {store.filteredProducts.map((product) => (
          <div key={product.id} class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
            <figure class="relative group">
              <img
                src={product.image1_url}
                alt={product.name}
                class="w-full h-64  object-cover group-hover:opacity-0 transition-opacity absolute"
                width={400}
                height={400}
              />
              <img
                src={product.image2_url}
                alt={product.name}
                class="w-full h-64 object-cover opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </figure>
            <div class="card-body">
              <h2 class="card-title">{product.name}</h2>
              <p class="text-sm">{product.description}</p>
              <div class="flex items-center gap-2">
                <div class="rating rating-sm">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <input
                      key={star}
                      type="radio"
                      name={`rating-${product.id}`}
                      class="mask mask-star-2 bg-orange-400"
                      checked={Math.round(product.rating) === star}
                      disabled
                    />
                  ))}
                </div>
                <span class="text-sm">({product.number_of_buys} sold)</span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xl font-bold">{product.currency} {product.price}</span>
                <span class="text-sm text-gray-500">{product.stock} in stock</span>
              </div>
              <div class="card-actions justify-end mt-4">
                <button
                  class="btn btn-outline btn-primary btn-sm"
                  onClick$={() => {
                    selectedProduct.value = product;
                    showModal.value = true;
                  }}
                >
                  View Details
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  onClick$={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {showModal.value && selectedProduct.value && (
        <div class="modal modal-open">
          <div class="modal-box max-w-3xl">
            <div class="flex gap-6">
              <div class="w-1/2">
                <img
                  src={selectedProduct.value.image1_url}
                  alt={selectedProduct.value.name}
                  class="w-full h-auto rounded-lg"
                />
              </div>
              <div class="w-1/2">
                <h3 class="font-bold text-lg">{selectedProduct.value.name}</h3>
                <p class="py-4">{selectedProduct.value.description}</p>
                <div class="flex items-center gap-2 mb-4">
                  <div class="rating rating-md">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name="rating-modal"
                        class="mask mask-star-2 bg-orange-400"
                        checked={Math.round(selectedProduct.value!.rating) === star}
                        disabled
                      />
                    ))}
                  </div>
                  <span>({selectedProduct.value.number_of_buys} sold)</span>
                </div>
                <div class="flex justify-between items-center mb-4">
                  <span class="text-2xl font-bold">
                    {selectedProduct.value.currency} {selectedProduct.value.price}
                  </span>
                  <span class="text-gray-500">
                    {selectedProduct.value.stock} in stock
                  </span>
                </div>
                <button
                  class="btn btn-primary w-full"
                  onClick$={() => {
                    addToCart(selectedProduct.value!);
                    showModal.value = false;
                  }}
                  disabled={selectedProduct.value.stock === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
            <div class="modal-action">
              <button class="btn" onClick$={() => showModal.value = false}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProductSection;