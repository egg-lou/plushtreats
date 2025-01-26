import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

interface CartItem {
  id: number;
  name: string;
  price: string;
  currency: string;
  quantity: number;
}

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export default component$(() => {
  const cartItems = useSignal<CartItem[]>([]);
  const cartTotal = useSignal(0);
  const form = useSignal<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const nav = useNavigate();

  useVisibleTask$(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartItems.value = cart;
    cartTotal.value = cart.reduce((total: number, item: CartItem) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  });

  const handleCheckout = $(() => {
    // Here you would typically send the order to your backend
    // For now, we'll just clear the cart and show a success message
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    alert('Order placed successfully!');
    nav('/');
  });

  return (
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Checkout</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Order Summary</h2>
            <div class="divide-y">
              {cartItems.value.map((item) => (
                <div key={item.id} class="py-4">
                  <div class="flex justify-between">
                    <div>
                      <h3 class="font-semibold">{item.name}</h3>
                      <p class="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p class="font-semibold">
                      {item.currency} {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div class="mt-4 pt-4 border-t">
              <div class="flex justify-between items-center">
                <span class="text-xl font-bold">Total</span>
                <span class="text-xl font-bold">
                  {cartItems.value[0]?.currency || 'PHP'} {cartTotal.value.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4">Shipping Information</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">First Name</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered"
                  value={form.value.firstName}
                  onInput$={(e) => (form.value.firstName = (e.target as HTMLInputElement).value)}
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Last Name</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered"
                  value={form.value.lastName}
                  onInput$={(e) => (form.value.lastName = (e.target as HTMLInputElement).value)}
                  required
                />
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input
                type="email"
                class="input input-bordered"
                value={form.value.email}
                onInput$={(e) => (form.value.email = (e.target as HTMLInputElement).value)}
                required
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Address</span>
              </label>
              <textarea
                class="textarea textarea-bordered"
                value={form.value.address}
                onInput$={(e) => (form.value.address = (e.target as HTMLTextAreaElement).value)}
                required
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">City</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered"
                  value={form.value.city}
                  onInput$={(e) => (form.value.city = (e.target as HTMLInputElement).value)}
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Postal Code</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered"
                  value={form.value.postalCode}
                  onInput$={(e) => (form.value.postalCode = (e.target as HTMLInputElement).value)}
                  required
                />
              </div>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Phone</span>
              </label>
              <input
                type="tel"
                class="input input-bordered"
                value={form.value.phone}
                onInput$={(e) => (form.value.phone = (e.target as HTMLInputElement).value)}
                required
              />
            </div>
            <div class="form-control mt-6">
              <button
                class="btn btn-primary"
                onClick$={handleCheckout}
                disabled={cartItems.value.length === 0}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}); 