"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Order = {
  product_id: number;
  product_name: string;
  emoji: string;
  price: number;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("token");
    if (!username) {
      router.push("/login");
      return;
    }
    fetch(`https://flash-sale-engine-backend.onrender.com/orders/${username}`)
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-red-500 mt-8">📦 My Orders</h1>
      <button
        onClick={() => router.push("/")}
        className="mt-4 bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm"
      >
        ← Back to Sale
      </button>
      {orders.length === 0 ? (
        <p className="mt-10 text-zinc-400 text-xl">No orders yet!</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4 w-full max-w-md">
          {orders.map((order, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex items-center gap-4">
              <div className="text-4xl">{order.emoji}</div>
              <div>
                <p className="text-white font-bold">{order.product_name}</p>
                <p className="text-green-400">₹{order.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
