"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LoaderCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setSuccess(
            "Account created! Check your email for a confirmation link before signing in."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.replace("/");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#141416] px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-2"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
            <Sparkles size={22} />
          </div>

          <span className="text-2xl font-semibold text-white">
            Nexus <span className="text-violet-400">AI</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#1c1c20] p-7 shadow-xl">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-semibold text-white">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {isSignUp
                ? "Create an account to start using Nexus AI."
                : "Sign in to continue to your AI workspace."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#141416] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-white/10 bg-[#141416] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <LoaderCircle size={17} className="animate-spin" />
              )}

              {loading
                ? "Please wait..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="ml-2 font-medium text-violet-400 hover:text-violet-300"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          By continuing, you agree to use Nexus AI responsibly.
        </p>
      </div>
    </main>
  );
}