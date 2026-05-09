"use client";
import { useState, useEffect } from "react";

type Product = {
  id: number;
  name: string;
  emoji: string;
  price: number;
  original: number;
  stock: number;
};

export default function Home() {
  const [time, setTime] = useState(600);
  const [products, setProducts] = useState<Product[]>([]);
  const [queue, setQueue] = useState<{[key: number]: number}>({});
  const [viewers, setViewers] = useState(2431);
  const saleEnded = time === 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  useEffect(() => {
    fetch("https://flash-sale-engine-backend.onrender.com/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const viewerTimer = setInterval(() => {
      setViewers((prev) => prev + Math.floor(Math.random() * 10) - 3);
    }, 2000);
    return () => clearInterval(viewerTimer);
  }, []);

  const handleBuy = async (id: number) => {
    if (saleEnded) return;
    const username = localStorage.getItem("token") || "";
    const res = await fetch("https://flash-sale-engine-backend.onrender.com/buy/" + id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (res.ok) {
      const position = Math.floor(Math.random() * 50) + 1;
      setQueue((prev) => ({ ...prev, [id]: position }));
      setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, stock: data.remaining_stock } : p)
      );
    }
  };

  const minutes = String(Math.floor(time / 60)).padStart(2, "0");
  const seconds = String(time % 60).padStart(2, "0");

  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center p-8">
      <h1 className="text-6xl font-bold text-red-500 mt-8">⚡ Flash Sale</h1>
      <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} className="absolute top-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm">Logout</button>
      <button onClick={() => window.location.href = "/orders"} className="absolute top-4 left-4 bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm">📦 My Orders</button>
      {saleEnded ? (
        <div className="mt-10 text-center">
          <p className="text-6xl">😢</p>
          <p className="text-4xl font-bold text-zinc-400 mt-4">Sale Ended!</p>
        </div>
      ) : (
        <>
          <p className="text-xl mt-4 text-zinc-400">Sale ends in...</p>
          <div className="text-8xl font-mono mt-4 text-white">{minutes}:{seconds}</div>
          <p className="mt-4 text-green-400 text-lg font-semibold">
            🟢 {viewers.toLocaleString()} people watching live
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {products.map((p) => {
              const discount = Math.round((1 - p.price / p.original) * 100);
              return (
                <div key={p.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex flex-col items-center w-72">
                  <div className="text-8xl">{p.emoji}</div>
                  <h2 className="text-2xl font-bold mt-4">{p.name}</h2>
                  <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
                    <span className="text-3xl font-bold text-green-400">₹{p.price}</span>
                    <span className="text-xl text-zinc-500 line-through">₹{p.original}</span>
                    <span className="bg-red-600 text-white text-sm px-2 py-1 rounded">{discount}% OFF</span>
                  </div>
                  <p className="mt-4 text-orange-400 font-semibold">🔥 Only {p.stock} left!</p>
                  <button
                    onClick={() => handleBuy(p.id)}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white text-xl py-3 rounded-xl"
                  >
                    Buy Now
                  </button>
                  {queue[p.id] && (
                    <div className="mt-4 text-center">
                      <p className="text-green-400 font-bold">✅ In queue!</p>
                      <p className="text-zinc-300">Position: <span className="text-white font-bold">#{queue[p.id]}</span></p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
