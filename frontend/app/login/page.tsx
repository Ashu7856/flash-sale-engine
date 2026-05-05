"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const endpoint = isRegister ? "/register" : "/login";
    const res = await fetch(`https://flash-sale-engine-backend.onrender.com${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      if (!isRegister) {
        localStorage.setItem("token", data.access_token);
        router.push("/");
      } else {
        setMessage("Registered! Ab login karo.");
        setIsRegister(false);
      }
    } else {
      setMessage(data.detail);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-80">
        <h1 className="text-3xl font-bold text-red-500 text-center mb-6">
          {isRegister ? "Register" : "Login"}
        </h1>
        <input
          className="w-full bg-zinc-800 rounded-xl px-4 py-3 mb-4 text-white"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full bg-zinc-800 rounded-xl px-4 py-3 mb-4 text-white"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {message && <p className="text-yellow-400 text-sm mb-4">{message}</p>}
        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xl"
        >
          {isRegister ? "Register" : "Login"}
        </button>
        <p
          className="text-zinc-400 text-center mt-4 cursor-pointer hover:text-white"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Already have account? Login" : "No account? Register"}
        </p>
      </div>
    </main>
  );
}
