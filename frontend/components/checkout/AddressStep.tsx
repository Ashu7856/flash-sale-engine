"use client";
import { useState } from "react";
import { Address } from "../CheckoutDrawer";

const DEFAULT_ADDRESSES: Address[] = [
  { id: "1", label: "Home", line: "42, 3rd Cross, Koramangala, Bengaluru 560034", pincode: "560034", isDefault: true },
  { id: "2", label: "Work", line: "Level 4, Prestige Tech Park, Outer Ring Road, Bengaluru 560103", pincode: "560103" },
];

type Props = { selected: Address | null; onSelect: (a: Address) => void; onNext: () => void };

export default function AddressStep({ selected, onSelect, onNext }: Props) {
  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", line: "", pincode: "" });

  const handleAdd = () => {
    if (!form.label || !form.line || !form.pincode) return;
    const newAddr: Address = { id: Date.now().toString(), ...form };
    setAddresses((prev) => [...prev, newAddr]);
    onSelect(newAddr);
    setShowForm(false);
    setForm({ label: "", line: "", pincode: "" });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Saved addresses</p>
      {addresses.map((addr) => (
        <div key={addr.id} onClick={() => onSelect(addr)}
          className={`border rounded-xl p-3 cursor-pointer transition-all ${selected?.id === addr.id ? "border-violet-600 ring-1 ring-violet-600" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{addr.label}</span>
              {addr.isDefault && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">Default</span>}
            </div>
            {selected?.id === addr.id && <span className="text-violet-600 text-sm">✓</span>}
          </div>
          <p className="text-xs text-zinc-500 mt-1">{addr.line}</p>
        </div>
      ))}
      {showForm ? (
        <div className="border border-dashed border-zinc-300 rounded-xl p-3 flex flex-col gap-2">
          <input className="border rounded-lg px-3 py-2 text-sm w-full" placeholder="Label (e.g. Home)" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm w-full" placeholder="Full address" value={form.line} onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm w-full" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 border rounded-lg py-2 text-sm text-zinc-500">Cancel</button>
            <button onClick={handleAdd} className="flex-1 bg-violet-600 text-white rounded-lg py-2 text-sm font-medium">Save</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="border border-dashed border-zinc-300 rounded-xl py-3 text-sm text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition-colors">+ Add new address</button>
      )}
      <button onClick={onNext} disabled={!selected} className="w-full bg-violet-600 disabled:opacity-40 text-white rounded-xl py-3 text-sm font-semibold mt-2">Continue to payment →</button>
    </div>
  );
}
