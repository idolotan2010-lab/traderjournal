"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleAuth() {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Logged in!");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Account created!");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="mb-2 text-3xl font-black text-white">
          {isLogin ? "Login" : "Create Account"}
        </h1>

        <p className="mb-8 text-zinc-500">
          Welcome to TradeJournal Pro
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none focus:border-purple-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-white outline-none focus:border-purple-500"
          />

          <button
            onClick={handleAuth}
            className="w-full rounded-2xl bg-purple-600 py-4 font-bold text-white transition hover:bg-purple-500"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </div>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-sm text-zinc-400 hover:text-white"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}