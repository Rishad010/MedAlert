// frontend/src/pages/Pharmacy.tsx
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { pharmacyAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  sku: string;
  name: string;
  strength: string;
  form: string;
  price: number;
  prescriptionRequired: boolean;
  stockQty: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface OrderForm {
  customerName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export function Pharmacy() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState<OrderForm>({
    customerName: user?.name || "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => pharmacyAPI.getProducts().then((res) => res.data),
  });

  const orderMutation = useMutation({
    mutationFn: pharmacyAPI.placeOrder,
    onSuccess: () => {
      setCart([]);
      setShowCheckout(false);
      setOrderPlaced(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to place order");
    },
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === product.sku
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stockQty) }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQty = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.sku === sku ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = () => {
    if (!form.customerName || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill in all delivery details");
      return;
    }
    orderMutation.mutate({
      customerName: form.customerName,
      phone: form.phone,
      address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
      items: cart.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      paymentMethod: "COD",
    });
  };

  // ── Order success screen ──────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <CheckCircle className="h-16 w-16 text-success-600" />
        <h2 className="text-2xl font-bold text-gray-900">Order placed!</h2>
        <p className="text-gray-500">
          Your medicines will be delivered to your address.
        </p>
        <button
          className="btn-primary mt-4"
          onClick={() => setOrderPlaced(false)}
        >
          Continue shopping
        </button>
      </div>
    );
  }

  // ── Checkout screen ───────────────────────────────────────────────
  if (showCheckout) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <button
            className="text-sm text-primary-600 hover:underline"
            onClick={() => setShowCheckout(false)}
          >
            ← Back to cart
          </button>
        </div>

        {/* Order summary */}
        <div className="card space-y-3">
          <h2 className="font-medium text-gray-900">Order summary</h2>
          {cart.map((item) => (
            <div key={item.sku} className="flex justify-between text-sm text-gray-700">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-medium text-gray-900">
            <span>Total</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Prescription warning */}
        {cart.some((item) => item.prescriptionRequired) && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-warning-100 text-warning-700 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>
              One or more items require a prescription. Our team will contact
              you to verify before dispatch.
            </p>
          </div>
        )}

        {/* Delivery form */}
        <div className="card space-y-4">
          <h2 className="font-medium text-gray-900">Delivery details</h2>
          {(
            [
              { key: "customerName", label: "Full name", placeholder: "Your full name" },
              { key: "phone", label: "Phone number", placeholder: "10-digit mobile number" },
              { key: "line1", label: "Address", placeholder: "House / flat / street" },
              { key: "city", label: "City", placeholder: "City" },
              { key: "state", label: "State", placeholder: "State" },
              { key: "pincode", label: "Pincode", placeholder: "6-digit pincode" },
            ] as { key: keyof OrderForm; label: string; placeholder: string }[]
          ).map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Payment method: Cash on Delivery</span>
        </div>

        <button
          className="btn-primary w-full"
          onClick={handleSubmitOrder}
          disabled={orderMutation.isPending}
        >
          {orderMutation.isPending ? "Placing order..." : `Place order · ₹${totalAmount.toFixed(2)}`}
        </button>
      </div>
    );
  }

  // ── Main catalog ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
          <p className="mt-1 text-sm text-gray-500">
            Order medicines delivered to your door
          </p>
        </div>
        {cartCount > 0 && (
          <button
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowCheckout(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            Cart ({cartCount}) · ₹{totalAmount.toFixed(2)}
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!products || products.length === 0) && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No products available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later or contact support.
          </p>
        </div>
      )}

      {/* Product grid */}
      {!isLoading && products && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product: Product) => {
            const inCart = cart.find((item) => item.sku === product.sku);
            return (
              <div key={product._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {product.strength} · {product.form}
                    </p>
                  </div>
                  {product.prescriptionRequired && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
                      Rx
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {product.stockQty} in stock
                  </span>
                </div>

                <div className="mt-4">
                  {inCart ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(product.sku, -1)}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(product.sku, 1)}
                          disabled={inCart.quantity >= product.stockQty}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.sku)}
                        className="text-gray-400 hover:text-danger-600"
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}