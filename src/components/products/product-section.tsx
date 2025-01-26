import { component$, useStore, $, useSignal, useTask$ } from '@builder.io/qwik';
import { SearchFilter } from './filters/search-filter';
import { PriceFilter } from './filters/price-filter';
import { StockFilter } from './filters/stock-filter';
import { SortFilter } from './filters/sort-filter';
import productData from '~/data/product_details.json';
import { ProductCard } from './product-card';
import type { Product, ProductStore } from './types';

export default component$(() => {
  const store = useStore<ProductStore>({
    products: productData as Product[],
    filteredProducts: productData as Product[],
    searchQuery: '',
    priceRange: {
      min: 0,
      max: Math.max(...productData.map(p => parseFloat(p.price)))
    },
    showInStock: false,
    sortBy: 'popularity-high'
  });

  const showMobileFilters = useSignal(false);

  // Filter and sort products
  const updateFilters = $(() => {
    let filtered = [...store.products];

    // Apply search filter
    if (store.searchQuery) {
      const query = store.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Apply price filter
    filtered = filtered.filter(
      (product) => {
        const price = parseFloat(product.price);
        return price >= store.priceRange.min && price <= store.priceRange.max;
      }
    );

    // Apply stock filter
    if (store.showInStock) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    // Create a new array for sorting to avoid mutation issues
    filtered = [...filtered];

    // Apply sorting
    console.log('Sorting by:', store.sortBy);
    switch (store.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating-high':
        filtered.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });
        break;
      case 'rating-low':
        filtered.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingA - ratingB;
        });
        break;
      case 'popularity-high':
        filtered.sort((a, b) => {
          const buysA = a.number_of_buys || 0;
          const buysB = b.number_of_buys || 0;
          return buysB - buysA;
        });
        break;
      case 'popularity-low':
        filtered.sort((a, b) => {
          const buysA = a.number_of_buys || 0;
          const buysB = b.number_of_buys || 0;
          return buysA - buysB;
        });
        break;
      default:
        // Default to most popular
        filtered.sort((a, b) => {
          const buysA = a.number_of_buys || 0;
          const buysB = b.number_of_buys || 0;
          return buysB - buysA;
        });
    }

    console.log('Filtered products after sort:', filtered);
    store.filteredProducts = filtered;
  });

  // Initialize price range and filters
  useTask$(({ track }) => {
    track(() => store.products);
    
    const prices = store.products.map(p => parseFloat(p.price));
    store.priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
    updateFilters();
  });

  // Cart functionality
  const addToCart$ = $((product: Product, quantity: number) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  });

  return (
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row gap-6">
        {/* Mobile Search and Filter Toggle */}
        <div class="md:hidden w-full">
          <SearchFilter
            searchQuery={store.searchQuery}
            onSearch$={(query) => {
              store.searchQuery = query;
              updateFilters();
            }}
          />
          <button
            class="btn btn-ghost w-full mt-2 flex items-center justify-between"
            onClick$={() => showMobileFilters.value = !showMobileFilters.value}
          >
            <span>Filters</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class={`h-4 w-4 transition-transform ${showMobileFilters.value ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filters Section */}
        <div 
          class={`
            md:w-64 space-y-4 bg-base-100 p-4 rounded-lg
            ${showMobileFilters.value ? 'block' : 'hidden'}
            md:block
          `}
        >
          {/* Desktop Search */}
          <div class="hidden md:block">
            <SearchFilter
              searchQuery={store.searchQuery}
              onSearch$={(query) => {
                store.searchQuery = query;
                updateFilters();
              }}
            />
          </div>

          <PriceFilter
            priceRange={store.priceRange}
            onPriceChange$={(range) => {
              store.priceRange = range;
              updateFilters();
            }}
          />

          <StockFilter
            showInStock={store.showInStock}
            onStockChange$={(show) => {
              store.showInStock = show;
              updateFilters();
            }}
          />

          <SortFilter
            sortBy={store.sortBy}
            onSortChange$={(sort) => {
              console.log('Sort changed to:', sort); // Debug log
              store.sortBy = sort;
              updateFilters();
            }}
          />
        </div>

        {/* Products Grid */}
        <div class="flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {store.filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart$={addToCart$}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});