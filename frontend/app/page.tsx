"use client";
import { useState, useEffect } from "react";
import CheckoutDrawer from "../components/CheckoutDrawer";

type Product = {
  id: number;
  name: string;
  emoji: string;
  price: number;
  original: number;
  stock: number;
};

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function Home() {
  const [time, setTime] = useState(600);
  const [products, setProducts] = useState<Product[]>([]);
  const [queue, setQueue] = useState<{[key: number]: number}>({});
  const [viewers, setViewers] = useState(2431);
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUsername] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: string, price: number} | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! I'm your Flash Sale AI assistant 🤖 Ask me anything about the products!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const saleEnded = time === 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
    else setUsername(token);
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

  const handleBuy = (id: number, price: number) => {
    if (saleEnded) return;
    setSelectedProduct({ id: String(id), price });
    setCheckoutOpen(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://flash-sale-engine-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, something went wrong!" }]);
    } finally {
      setLoading(false);
    }
  };

  const minutes = String(Math.floor(time / 60)).padStart(2, "0");
  const seconds = String(time % 60).padStart(2, "0");

  return (
    <>
      <main className="relative min-h-screen bg-black text-white flex flex-col items-center p-8">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full bg-red-600 text-white font-bold text-lg flex items-center justify-center"
          >
            {username ? username[0].toUpperCase() : "U"}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg z-10">
              <p className="px-4 py-3 text-zinc-400 text-sm border-b border-zinc-700">👤 {username}</p>
              <button onClick={() => window.location.href = "/orders"} className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-white">📦 My Orders</button>
              <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} className="w-full text-left px-4 py-3 hover:bg-zinc-800 text-red-400 rounded-b-xl">🚪 Logout</button>
            </div>
          )}
        </div>

        <h1 className="text-6xl font-bold text-red-500 mt-8">⚡ Flash Sale</h1>

        {saleEnded ? (
          <div className="mt-10 text-center">
            <p className="text-6xl">😢</p>
            <p className="text-4xl font-bold text-zinc-400 mt-4">Sale Ended!</p>
          </div>
        ) : (
          <>
            <p className="text-xl mt-4 text-zinc-400">Sale ends in...</p>
            <div className="text-8xl font-mono mt-4 text-white">{minutes}:{seconds}</div>
            <p className="mt-4 text-green-400 text-lg font-semibold">🟢 {viewers.toLocaleString()} people watching live</p>
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
                    <button onClick={() => handleBuy(p.id, p.price)} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white text-xl py-3 rounded-xl">Buy Now</button>
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

      {/* Chatbot Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full text-2xl shadow-lg z-50 flex items-center justify-center"
      >
        🤖
      </button>

      {/* Chatbot Window */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 flex flex-col" style={{height: "400px"}}>
          <div className="px-4 py-3 border-b border-zinc-700 flex justify-between items-center">
            <p className="font-bold text-white">🤖 AI Assistant</p>
            <button onClick={() => setChatOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm px-3 py-2 rounded-xl max-w-xs ${m.role === "user" ? "bg-red-600 text-white self-end" : "bg-zinc-800 text-zinc-200 self-start"}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="bg-zinc-800 text-zinc-400 text-sm px-3 py-2 rounded-xl self-start">Thinking...</div>}
          </div>
          <div className="p-3 border-t border-zinc-700 flex gap-2">
            <input
              className="flex-1 bg-zinc-800 text-white rounded-xl px-3 py-2 text-sm outline-none"
              placeholder="Ask about products..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm">Send</button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <CheckoutDrawer
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          productId={selectedProduct.id}
          price={selectedProduct.price}
        />
      )}
    </>
  );
}