"use client";
import { PaymentMethod } from "../CheckoutDrawer";

type Props = { method: PaymentMethod; upiId: string; onMethodChange: (m: PaymentMethod) => void; onUpiChange: (v: string) => void; onBack: () => void; onNext: () => void };

const METHODS = [
  { id: "upi" as const, label: "UPI", sub: "GPay, PhonePe, BHIM", icon: "📱" },
  { id: "card" as const, label: "Credit / Debit card", sub: "Visa, Mastercard, RuPay — via Razorpay", icon: "💳" },
  { id: "cod" as const, label: "Cash on delivery", sub: "Pay when order arrives", icon: "💵" },
];

export default function PaymentStep({ method, upiId, onMethodChange, onUpiChange, onBack, onNext }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Payment method</p>
      {METHODS.map((m) => (
        <div key={m.id}>
          <div onClick={() => onMethodChange(m.id)}
            className={`border rounded-xl p-3 cursor-pointer flex items-center gap-3 transition-all ${method === m.id ? "border-violet-600 ring-1 ring-violet-600" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"}`}>
            <span className="text-xl">{m.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-zinc-400">{m.sub}</p>
            </div>
            {method === m.id && <span className="text-violet-600 text-sm">✓</span>}
          </div>
          {m.id === "upi" && method === "upi" && (
            <input className="mt-1 border border-violet-200 bg-violet-50 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Enter UPI ID (e.g. name@okaxis)" value={upiId} onChange={(e) => onUpiChange(e.target.value)} />
          )}
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <button onClick={onBack} className="flex-1 border border-zinc-200 rounded-xl py-3 text-sm text-zinc-500 hover:bg-zinc-50">← Back</button>
        <button onClick={onNext} className="flex-[2] bg-violet-600 text-white rounded-xl py-3 text-sm font-semibold">Review order →</button>
      </div>
    </div>
  );
}
