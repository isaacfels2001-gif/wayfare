"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

const initialState: AuthActionState = {};

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </div>
      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{state.error}</p>
      )}
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        New here?{" "}
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
          Create an account
        </Link>
      </p>
      <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Demo credentials — customer: <span className="font-mono">customer@ota-demo.test</span> /{" "}
        <span className="font-mono">Traveler123!</span>
        <br />
        Admin: <span className="font-mono">admin@ota-demo.test</span> / <span className="font-mono">Admin123!</span>
      </div>
    </form>
  );
}
