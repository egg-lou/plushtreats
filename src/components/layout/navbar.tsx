import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

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

  const updateCart = $(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartItems.value = cart;
    cartTotal.value = cart.reduce((total: number, item: CartItem) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  });

  // Initialize cart from localStorage
  useVisibleTask$(() => {
    updateCart();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', () => {
      updateCart();
    });
  });

  const removeFromCart = $((productId: number) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter((item: CartItem) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCart();
  });

  const updateQuantity = $((productId: number, newQuantity: number) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find((item: CartItem) => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, newQuantity);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
    }
  });

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          <img src="/plushTreats.png" alt="PlushTreats" className="h-16 w-16" />
          <span className="text-2xl font-bold">PlushTreats ❤️</span>
        </Link>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
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
              <span className="badge badge-sm indicator-item">
                {cartItems.value.reduce((total, item) => total + item.quantity, 0)}
              </span>
            </div>
          </div>
          <div
            tabIndex={0}
            className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-96 shadow-xl">
            <div className="card-body">
              <span className="text-lg font-bold">
                {cartItems.value.reduce((total, item) => total + item.quantity, 0)} Items
              </span>
              <div className="max-h-96 overflow-auto">
                {cartItems.value.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.currency} {item.price} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-xs"
                        onClick$={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="btn btn-xs"
                        onClick$={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick$={() => removeFromCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-info text-xl">
                Total: {cartItems.value[0]?.currency || 'PHP'} {cartTotal.value.toFixed(2)}
              </span>
              <div className="card-actions">
                <Link href="/checkout" className="btn btn-primary btn-block">
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Navbar;