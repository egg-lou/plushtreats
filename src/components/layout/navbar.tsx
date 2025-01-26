import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Link, useNavigate } from '@builder.io/qwik-city';

interface CartItem {
  id: number;
  name: string;
  price: string;
  currency: string;
  quantity: number;
}

const Navbar = component$(() => {
  const cartItems = useSignal<CartItem[]>([]);
  const cartTotal = useSignal(0);
  const nav = useNavigate();

  const updateCart = $(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartItems.value = cart;
    cartTotal.value = cart.reduce((total: number, item: CartItem) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  });

  // Initialize cart from localStorage
  useTask$(() => {
    if (typeof window !== 'undefined') {
      updateCart();

      // Listen for cart updates
      window.addEventListener('cartUpdated', () => {
        updateCart();
      });
    }
  });

  const handleCheckout = $(() => {
    if (cartItems.value.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    nav('/checkout');
  });

  return (
    <div class="navbar bg-base-100 fixed top-0 z-50 shadow-md">
      <div class="flex-1">
        <Link href="/" class="btn btn-ghost text-xl">
          <img
            src="/plushTreats.png"
            alt="PlushTreats"
            class="h-16 w-16"
            loading="lazy"
          />
          <span class="text-xl font-bold">PlushTreats️</span>
        </Link>
      </div>
      <div class="flex-none">
        <Link href="/about" class="btn btn-ghost text-md">
          About
        </Link>
        <div class="dropdown dropdown-end">
          <div tabIndex={0} role="button" class="btn btn-ghost btn-circle">
            <div class="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span class="badge badge-sm indicator-item">
                {cartItems.value.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}
              </span>
            </div>
          </div>
          <div
            tabIndex={0}
            class="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-96 shadow-xl"
          >
            <div class="card-body">
              <span class="text-lg font-bold">
                {cartItems.value.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}{' '}
                Items
              </span>
              <div class="max-h-96 overflow-auto">
                {cartItems.value.map(item => (
                  <div
                    key={item.id}
                    class="flex justify-between items-center gap-4 mb-4"
                  >
                    <div>
                      <h3 class="font-bold">{item.name}</h3>
                      <p class="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="font-bold">
                        {item.currency}{' '}
                        {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div class="divider my-0"></div>
              <div class="flex justify-between font-bold">
                <span>Total</span>
                <span>PHP {cartTotal.value.toFixed(2)}</span>
              </div>
              <div class="card-actions">
                <button
                  class="btn btn-primary btn-block"
                  onClick$={handleCheckout}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Navbar;
