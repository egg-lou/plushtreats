import { component$, useSignal, useVisibleTask$, $, useStore } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

interface CartItem {
  id: number;
  name: string;
  price: string;
  currency: string;
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  shippingInfo: CheckoutForm;
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
  const orders = useSignal<Order[]>([]);
  const activeView = useSignal<'checkout' | 'orders'>('checkout');
  const loading = useSignal(false);
  const toast = useSignal({ show: false, message: '', type: 'success' });
  const showConfirmation = useSignal(false);
  const modalRef = useSignal<HTMLDialogElement>();
  
  const form = useStore<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const nav = useNavigate();

  // Load cart items and orders from localStorage
  useVisibleTask$(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    cartItems.value = cart;
    orders.value = savedOrders;
    cartTotal.value = cart.reduce((total: number, item: CartItem) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  });

  const showToast = $((message: string, type: 'success' | 'error') => {
    toast.value = { show: true, message, type };
    setTimeout(() => {
      toast.value.show = false;
    }, 3000);
  });

  const updateQuantity = $((productId: number, newQuantity: number) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find((item: CartItem) => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, newQuantity);
      localStorage.setItem('cart', JSON.stringify(cart));
      cartItems.value = cart;
      cartTotal.value = cart.reduce((total: number, item: CartItem) => {
        return total + parseFloat(item.price) * item.quantity;
      }, 0);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  });

  const removeFromCart = $((productId: number) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter((item: CartItem) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    cartItems.value = updatedCart;
    cartTotal.value = updatedCart.reduce((total: number, item: CartItem) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
    window.dispatchEvent(new Event('cartUpdated'));
  });

  const handleCheckout = $(async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.address || !form.city || !form.postalCode || !form.phone) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    showConfirmation.value = true;
    modalRef.value?.showModal();
  });

  const confirmOrder = $(async () => {
    loading.value = true;
    showConfirmation.value = false;
    modalRef.value?.close();
    
    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        items: [...cartItems.value],
        total: cartTotal.value,
        status: 'pending',
        date: new Date().toISOString(),
        shippingInfo: { ...form },
      };

      const updatedOrders = [...orders.value, newOrder];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      orders.value = updatedOrders;

      // Clear cart
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      cartItems.value = [];
      cartTotal.value = 0;

      showToast('Order placed successfully!', 'success');
      activeView.value = 'orders';
    } catch (error) {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      loading.value = false;
    }
  });

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'badge-warning',
      processing: 'badge-info',
      shipped: 'badge-primary',
      delivered: 'badge-success',
    };
    return colors[status];
  };

  return (
    <div class="min-h-screen bg-base-200 pt-24 pb-8">
      {/* Toast Notification */}
      {toast.value.show && (
        <div class={`toast toast-top toast-end`}>
          <div class={`alert ${toast.value.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span>{toast.value.message}</span>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      <dialog 
        ref={modalRef}
        class="modal modal-bottom sm:modal-middle"
        onClose$={() => {
          showConfirmation.value = false;
        }}
      >
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Confirm Your Order</h3>
          <div class="space-y-4">
            <div class="bg-base-200 p-4 rounded-lg">
              <h4 class="font-semibold mb-2">Order Summary</h4>
              <div class="space-y-2">
                {cartItems.value.map((item) => (
                  <div key={item.id} class="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{item.currency} {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div class="pt-2 border-t border-base-300">
                  <div class="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{cartItems.value[0]?.currency || 'PHP'} {cartTotal.value.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-base-200 p-4 rounded-lg">
              <h4 class="font-semibold mb-2">Shipping Information</h4>
              <div class="space-y-1 text-sm">
                <p>{form.firstName} {form.lastName}</p>
                <p>{form.email}</p>
                <p>{form.address}</p>
                <p>{form.city}, {form.postalCode}</p>
                <p>{form.phone}</p>
              </div>
            </div>
          </div>

          <div class="modal-action mt-6">
            <button 
              class="btn btn-ghost"
              onClick$={() => {
                showConfirmation.value = false;
                modalRef.value?.close();
              }}
            >
              Cancel
            </button>
            <button 
              class={`btn btn-primary ${loading.value ? 'loading' : ''}`}
              onClick$={confirmOrder}
              disabled={loading.value}
              type="button"
            >
              {loading.value ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <div class="container mx-auto px-4">
        <div class="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Navigation & Order History */}
          <div class="lg:w-1/4 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title mb-4">My Orders</h2>
                <div class="tabs tabs-boxed mb-4">
                  <button 
                    class={`tab ${activeView.value === 'checkout' ? 'tab-active' : ''}`}
                    onClick$={() => activeView.value = 'checkout'}
                  >
                    Checkout
                  </button>
                  <button 
                    class={`tab ${activeView.value === 'orders' ? 'tab-active' : ''}`}
                    onClick$={() => activeView.value = 'orders'}
                  >
                    Orders
                  </button>
                </div>

                {/* Recent Orders List */}
                <div class="space-y-4 overflow-y-auto">
                  {orders.value.map((order) => (
                    <div key={order.id} class="card bg-base-200 cursor-pointer hover:bg-base-300" onClick$={() => activeView.value = 'orders'}>
                      <div class="card-body p-4">
                        <div class="flex justify-between items-center">
                          <span class="font-semibold">Order #{order.id.slice(-4)}</span>
                          <span class={`badge ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p class="text-sm">{new Date(order.date).toLocaleDateString()}</p>
                        <p class="font-bold">PHP {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div class="lg:w-3/4">
            {activeView.value === 'checkout' ? (
              <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                  <h2 class="card-title mb-6">Checkout</h2>
                  
                  {/* Cart Items */}
                  <div class="mb-8">
                    <h3 class="font-bold text-lg mb-4">Order Summary</h3>
                    {cartItems.value.length === 0 ? (
                      <div class="text-center py-8">
                        <p class="text-lg opacity-70">Your cart is empty</p>
                        <Link href="/" class="btn btn-primary mt-4">
                          Continue Shopping
                        </Link>
                      </div>
                    ) : (
                      <div class="divide-y">
                        {cartItems.value.map((item) => (
                          <div key={item.id} class="py-4">
                            <div class="flex justify-between items-center gap-4">
                              <div class="flex-1">
                                <h4 class="font-semibold">{item.name}</h4>
                                <p class="text-sm opacity-70">{item.currency} {item.price} each</p>
                              </div>
                              <div class="flex items-center gap-2">
                                <button
                                  class="btn btn-square btn-sm"
                                  onClick$={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  -
                                </button>
                                <span class="w-8 text-center">{item.quantity}</span>
                                <button
                                  class="btn btn-square btn-sm"
                                  onClick$={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </button>
                                <button
                                  class="btn btn-error btn-sm btn-square"
                                  onClick$={() => removeFromCart(item.id)}
                                >
                                  ×
                                </button>
                              </div>
                              <div class="text-right min-w-24">
                                <p class="font-semibold">
                                  {item.currency} {(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div class="mt-4 pt-4">
                          <div class="flex justify-between items-center">
                            <span class="text-xl font-bold">Total</span>
                            <span class="text-xl font-bold">
                              {cartItems.value[0]?.currency || 'PHP'} {cartTotal.value.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {cartItems.value.length > 0 && (
                    <>
                      <h3 class="font-bold text-lg mb-4">Shipping Information</h3>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text">First Name</span>
                            <span class="label-text-alt text-error">*</span>
                          </label>
                          <input
                            type="text"
                            class={`input input-bordered w-full ${!form.firstName && 'input-error'}`}
                            value={form.firstName}
                            onInput$={(e) => (form.firstName = (e.target as HTMLInputElement).value)}
                            required
                          />
                          {!form.firstName && (
                            <label class="label">
                              <span class="label-text-alt text-error">First name is required</span>
                            </label>
                          )}
                        </div>

                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text">Last Name</span>
                            <span class="label-text-alt text-error">*</span>
                          </label>
                          <input
                            type="text"
                            class={`input input-bordered w-full ${!form.lastName && 'input-error'}`}
                            value={form.lastName}
                            onInput$={(e) => (form.lastName = (e.target as HTMLInputElement).value)}
                            required
                          />
                          {!form.lastName && (
                            <label class="label">
                              <span class="label-text-alt text-error">Last name is required</span>
                            </label>
                          )}
                        </div>

                        <div class="form-control w-full md:col-span-2">
                          <label class="label">
                            <span class="label-text">Email</span>
                            <span class="label-text-alt text-error">*</span>
                          </label>
                          <input
                            type="email"
                            class={`input input-bordered w-full ${!form.email && 'input-error'}`}
                            value={form.email}
                            onInput$={(e) => (form.email = (e.target as HTMLInputElement).value)}
                            required
                          />
                          {!form.email && (
                            <label class="label">
                              <span class="label-text-alt text-error">Email is required</span>
                            </label>
                          )}
                        </div>

                        <div class="form-control w-full md:col-span-2">
                          <label class="label">
                            <span class="label-text">Address</span>
                            <span class="label-text-alt text-error">*</span>
                          </label>
                          <textarea
                            class={`textarea textarea-bordered w-full ${!form.address && 'textarea-error'}`}
                            value={form.address}
                            onInput$={(e) => (form.address = (e.target as HTMLTextAreaElement).value)}
                            required
                            rows={3}
                          />
                          {!form.address && (
                            <label class="label">
                              <span class="label-text-alt text-error">Address is required</span>
                            </label>
                          )}
                        </div>

                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text">City</span>
                            <span class="label-text-alt text-error">*</span>
                          </label>
                          <input
                            type="text"
                            class={`input input-bordered w-full ${!form.city && 'input-error'}`}
                            value={form.city}
                            onInput$={(e) => (form.city = (e.target as HTMLInputElement).value)}
                            required
                          />
                          {!form.city && (
                            <label class="label">
                              <span class="label-text-alt text-error">City is required</span>
                            </label>
                          )}
                        </div>

                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text">Postal Code</span>
                            <span class="label-text-alt text-error">*</span>
                          </label>
                          <input
                            type="text"
                            class={`input input-bordered w-full ${!form.postalCode && 'input-error'}`}
                            value={form.postalCode}
                            onInput$={(e) => (form.postalCode = (e.target as HTMLInputElement).value)}
                            required
                          />
                          {!form.postalCode && (
                            <label class="label">
                              <span class="label-text-alt text-error">Postal code is required</span>
                            </label>
                          )}
                        </div>

                        <div class="form-control w-full md:col-span-2">
                          <label class="label">
                            <span class="label-text">Phone</span>
                            <span class="label-text-alt text-error">*</span>
                          </label>
                          <input
                            type="tel"
                            class={`input input-bordered w-full ${!form.phone && 'input-error'}`}
                            value={form.phone}
                            onInput$={(e) => (form.phone = (e.target as HTMLInputElement).value)}
                            required
                          />
                          {!form.phone && (
                            <label class="label">
                              <span class="label-text-alt text-error">Phone is required</span>
                            </label>
                          )}
                        </div>

                        <div class="form-control mt-6 md:col-span-2">
                          <button
                            class={`btn btn-primary ${loading.value ? 'loading' : ''}`}
                            onClick$={handleCheckout}
                            disabled={cartItems.value.length === 0 || loading.value}
                          >
                            {loading.value ? 'Processing...' : 'Place Order'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                  <h2 class="card-title mb-6">Order History</h2>
                  {orders.value.length === 0 ? (
                    <div class="text-center py-8">
                      <p class="text-lg opacity-70">No orders yet</p>
                      <button 
                        class="btn btn-primary mt-4"
                        onClick$={() => activeView.value = 'checkout'}
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div class="space-y-6">
                      {orders.value.map((order) => (
                        <div key={order.id} class="card bg-base-200">
                          <div class="card-body">
                            <div class="flex justify-between items-center">
                              <h3 class="font-bold">Order #{order.id.slice(-4)}</h3>
                              <span class={`badge ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p class="text-sm">{new Date(order.date).toLocaleDateString()}</p>
                            <div class="divider"></div>
                            <div class="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} class="flex justify-between">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>{item.currency} {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div class="divider"></div>
                            <div class="flex justify-between font-bold">
                              <span>Total</span>
                              <span>PHP {order.total.toFixed(2)}</span>
                            </div>
                            <div class="mt-4">
                              <h4 class="font-semibold mb-2">Shipping Information</h4>
                              <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                              <p>{order.shippingInfo.address}</p>
                              <p>{order.shippingInfo.city}, {order.shippingInfo.postalCode}</p>
                              <p>{order.shippingInfo.phone}</p>
                              <p>{order.shippingInfo.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});