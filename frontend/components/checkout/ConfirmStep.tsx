"use client";
import { useState } from "react";
import { Address, PaymentMethod } from "../CheckoutDrawer";

type Props = { address: Address; method: PaymentMethod; price: number; productId: string; upiId: string; onBack: () => void; onClose: () => void };

declare global { interface Window { Razorpay: any; } }

function loadRazorpay(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}

export default function ConfirmStep({ address, method, price, productId, upiId, onBack, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (method === "cod") { await placeCODOrder(); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, productId, addressId: address.id }),
      });
      const { orderId, key } = await res.json();
      await loadRazorpay();
      const rzp = new window.Razorpay({
        key, amount: price * 100, currency: "INR",
        name: "Flash Sale", description: "Flash Sale Order", order_id: orderId,
        prefill: { method: method === "upi" ? "upi" : "card", vpa: upiId || undefined },
        theme: { color: "#7C3AED" },
        handler: async (response: any) => {
          await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, productId, addressId: address.id }),
          });
          alert("Order placed! 🎉");
          onClose();
        },
      });
      rzp.open();
    } catch (e) {
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const placeCODOrder = async () => {
    setLoading(true);
    await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, addressId: address.id, paymentMethod: "cod" }) });
    alert("Order placed! Pay on delivery.");
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center py-3">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl mb-2">✓</div>
        <p className="text-base font-semibold">Order summary</p>
      </div>
      <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-4"><span className="text-zinc-400">Delivering to</span><span className="font-medium text-right">{address.label} · {address.line}</span></div>
        <div className="flex justify-between gap-4"><span className="text-zinc-400">Payment</span><span className="font-medium">{method === "upi" ? `UPI (${upiId})` : method === "card" ? "Card via Razorpay" : "Cash on delivery"}</span></div>
        <div className="border-t border-zinc-100 dark:border-zinc-700 pt-3 flex justify-between font-semibold text-base">
          <span>Total</span><span>₹{price.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <button onClick={handleOrder} disabled={loading} className="w-full bg-violet-600 disabled:opacity-50 text-white rounded-xl py-3 font-semibold">
        {loading ? "Processing..." : method === "cod" ? "Place order (COD)" : "Pay via Razorpay →"}
      </button>
      <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-600">← Change payment method</button>
    </div>
  );
}
