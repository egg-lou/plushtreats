import { component$, PropFunction, useSignal, $, useOnDocument } from '@builder.io/qwik';
import type { Product } from './types';

interface ProductCardProps {
  product: Product;
  onAddToCart$: PropFunction<(product: Product, quantity: number) => void>;
}

export const ProductCard = component$<ProductCardProps>(({ product, onAddToCart$ }) => {
  const showModal = useSignal(false);
  const showImageModal = useSignal(false);
  const quantity = useSignal(1);
  const isHovered = useSignal(false);
  const currentSlide = useSignal(1);
  const touchStart = useSignal(0);
  const touchEnd = useSignal(0);

  const handleQuantityChange$ = $((value: number) => {
    quantity.value = Math.max(1, Math.min(product.stock, value));
  });

  const nextSlide$ = $(() => {
    currentSlide.value = currentSlide.value === 1 ? 2 : 1;
  });

  const prevSlide$ = $(() => {
    currentSlide.value = currentSlide.value === 1 ? 2 : 1;
  });

  // Handle keyboard navigation
  useOnDocument(
    'keydown',
    $((event: KeyboardEvent) => {
      if (!showImageModal.value) return;

      if (event.key === 'ArrowRight') {
        nextSlide$();
      } else if (event.key === 'ArrowLeft') {
        prevSlide$();
      } else if (event.key === 'Escape') {
        showImageModal.value = false;
        currentSlide.value = 1;
      }
    })
  );

  // Handle touch events
  const handleTouchStart$ = $((e: TouchEvent) => {
    touchStart.value = e.touches[0].clientX;
  });

  const handleTouchMove$ = $((e: TouchEvent) => {
    touchEnd.value = e.touches[0].clientX;
  });

  const handleTouchEnd$ = $(() => {
    const swipeThreshold = 50;
    const diff = touchStart.value - touchEnd.value;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left, go next
        nextSlide$();
      } else {
        // Swipe right, go prev
        prevSlide$();
      }
    }
  });

  return (
    <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all">
      <figure 
        class="relative pt-[100%] overflow-hidden"
        onMouseEnter$={() => isHovered.value = true}
        onMouseLeave$={() => isHovered.value = false}
      >
        {/* First Image (Default) */}
        <img
          src={product.image1_url}
          alt={product.name}
          class="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={500}
          height={500}
        />
        {/* Second Image (Hover) */}
        <img
          src={product.image2_url}
          alt={`${product.name} alternate view`}
          class={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
            isHovered.value ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          loading="lazy"
          width={500}
          height={500}
        />
        {product.stock === 0 && (
          <div class="absolute inset-0 bg-base-300 bg-opacity-75 flex items-center justify-center">
            <span class="badge badge-error text-lg">Out of Stock</span>
          </div>
        )}
        {/* View Button */}
        <button 
          onClick$={() => showImageModal.value = true}
          class="btn btn-circle btn-sm absolute top-2 right-2 bg-base-100 bg-opacity-70 hover:bg-opacity-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </figure>
      <div class="card-body">
        <h3 class="card-title">{product.name}</h3>
        <p class="text-sm text-base-content/70">{product.description}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xl font-bold text-primary">
            {product.currency} {product.price}
          </span>
          <div class="flex items-center gap-1">
            <div class="rating rating-sm">
              <input
                type="radio"
                class="mask mask-star-2 bg-warning"
                checked={true}
                disabled
              />
            </div>
            <span class="text-sm text-base-content/70">{product.rating}</span>
          </div>
        </div>
        <div class="flex items-center justify-between mt-2">
          <span class="text-sm text-base-content/70">{product.number_of_buys} purchases</span>
          <button
            onClick$={() => showModal.value = true}
            disabled={product.stock === 0}
            class={`btn btn-primary btn-sm ${product.stock === 0 ? 'btn-disabled' : ''}`}
          >
            Add to Cart
          </button>
        </div>
        {product.stock > 0 && (
          <div class="mt-2">
            <span class="badge badge-ghost">
              {product.stock} {product.stock === 1 ? 'item' : 'items'} left
            </span>
          </div>
        )}
      </div>

      {/* Image Modal with Carousel */}
      <dialog class={`modal ${showImageModal.value ? 'modal-open' : ''}`}>
        <div class="modal-box w-11/12 max-w-5xl h-[80vh] p-0 relative">
          <div class="carousel w-full h-full">
            {/* Slides Container */}
            <div 
              class="relative w-full h-full"
              onTouchStart$={handleTouchStart$}
              onTouchMove$={handleTouchMove$}
              onTouchEnd$={handleTouchEnd$}
            >
              {/* First Slide */}
              <div 
                class={`absolute w-full h-full transition-all duration-300 ${
                  currentSlide.value === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
                }`}
              >
                <img 
                  src={product.image1_url} 
                  alt={product.name}
                  class="w-full h-full object-contain"
                  width={500}
                  height={500}
                />
              </div>
              {/* Second Slide */}
              <div 
                class={`absolute w-full h-full transition-all duration-300 ${
                  currentSlide.value === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
              >
                <img 
                  src={product.image2_url} 
                  alt={`${product.name} alternate view`}
                  class="w-full h-full object-contain"
                  width={500}
                  height={500}
                />
              </div>
              {/* Navigation Buttons */}
              <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                <button 
                  class="btn btn-circle" 
                  onClick$={prevSlide$}
                  title="Previous image"
                >❮</button>
                <button 
                  class="btn btn-circle" 
                  onClick$={nextSlide$}
                  title="Next image"
                >❯</button>
              </div>
              {/* Slide Indicators */}
              <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <button 
                  class={`btn btn-xs ${currentSlide.value === 1 ? 'btn-primary' : 'btn-ghost'}`}
                  onClick$={() => currentSlide.value = 1}
                  title="View first image"
                >
                  1
                </button>
                <button 
                  class={`btn btn-xs ${currentSlide.value === 2 ? 'btn-primary' : 'btn-ghost'}`}
                  onClick$={() => currentSlide.value = 2}
                  title="View second image"
                >
                  2
                </button>
              </div>
            </div>
          </div>
          <button 
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick$={() => {
              showImageModal.value = false;
              currentSlide.value = 1;
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button onClick$={() => {
            showImageModal.value = false;
            currentSlide.value = 1;
          }}>close</button>
        </form>
      </dialog>

      {/* Quantity Modal */}
      <dialog class={`modal modal-bottom sm:modal-middle ${showModal.value ? 'modal-open' : ''}`}>
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">{product.name}</h3>
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <span class="text-lg">Quantity:</span>
              <div class="join">
                <button 
                  class="btn join-item"
                  onClick$={() => handleQuantityChange$(quantity.value - 1)}
                >
                  -
                </button>
                <input 
                  type="number" 
                  class="input input-bordered join-item w-20 text-center"
                  value={quantity.value}
                  onInput$={(e) => handleQuantityChange$(parseInt((e.target as HTMLInputElement).value))}
                  min="1"
                  max={product.stock}
                />
                <button 
                  class="btn join-item"
                  onClick$={() => handleQuantityChange$(quantity.value + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div class="text-right text-lg font-semibold">
              Total: {product.currency} {(parseFloat(product.price) * quantity.value).toFixed(2)}
            </div>
          </div>
          <div class="modal-action">
            <button 
              class="btn"
              onClick$={() => {
                showModal.value = false;
                quantity.value = 1;
              }}
            >
              Cancel
            </button>
            <button 
              class="btn btn-primary"
              onClick$={() => {
                onAddToCart$(product, quantity.value);
                showModal.value = false;
                quantity.value = 1;
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button onClick$={() => showModal.value = false}>close</button>
        </form>
      </dialog>
    </div>
  );
});
