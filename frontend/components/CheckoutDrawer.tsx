"use client";
import { useState } from "react";
import AddressStep from "./checkout/AddressStep";
import PaymentStep from "./checkout/PaymentStep";
import ConfirmStep from "./checkout/ConfirmStep";

export type Address = {
  id: string;
  label: string;
  line: string;
  pincode: string;
  isDefault?: boolean;
};

export type PaymentMethod = "upi" | "card" | "cod";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  price: number;
};

const STEPS = ["Address", "Payment", "Confirm"] as const;

export default function CheckoutDrawer({ isOpen, onClose, productId, price }: Props) {
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 h-full overflow-y-auto shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-base font-semibold">Checkout</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl">✕</button>
        </div>
        <div className="flex items-center px-5 py-3 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${i <= step ? "bg-violet-600 text-white" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === step ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />}
            </div>
          ))}
        </div>
        <div className="flex-1 px-5 py-4">
          {step === 0 && (
            <AddressStep selected={selectedAddress} onSelect={setSelectedAddress} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <PaymentStep method={paymentMethod} upiId={upiId} onMethodChange={setPaymentMethod} onUpiChange={setUpiId} onBack={() => setStep(0)} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <ConfirmStep address={selectedAddress!} method={paymentMethod} price={price} productId={productId} upiId={upiId} onBack={() => setStep(1)} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
