"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { ROUTES } from "@/config/routes";
import { insforge } from "@/lib/insforge";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);


  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const { error } = await insforge.auth.signInWithOAuth({
        provider: "google",
        redirectTo: `${window.location.origin}${ROUTES.authCallback}`,
      });

      if (error) {
        toast.error(error.message);
        setGoogleLoading(false);
      }
    } catch {
      toast.error("Erreur lors de la connexion avec Google.");
      setGoogleLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
      businessName: String(fd.get("businessName") ?? "").trim(),
    };

    if (!payload.email) { setErrors({ email: "Email requis" }); setLoading(false); return; }
    if (payload.password.length < 8) {
      setErrors({ password: "8 caractères minimum" });
      setLoading(false); return;
    }
    if (!payload.businessName) { setErrors({ businessName: "Nom du commerce requis" }); setLoading(false); return; }

    try {
      console.log("[SignupForm] Sending payload:", payload);
      const res = await fetch(ROUTES.apiAuthSignup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("[SignupForm] Response received:", data);

      if (!res.ok) {
        toast.error(data?.error?.message ?? "Erreur à l'inscription.");
        setLoading(false);
        return;
      }

      if (data?.data?.requiresVerification) {
        toast.info("Un code de vérification a été envoyé à votre adresse email.");
        router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(payload.email)}&businessName=${encodeURIComponent(payload.businessName)}`);
        return;
      }

      toast.success("Compte créé. Bienvenue chez Localia !");
      router.push("/dashboard/onboarding");
      router.refresh();
    } catch (err) {
      console.error("[SignupForm] Error:", err);
      toast.error("Erreur réseau. Réessayez.");
      setLoading(false);
    }

  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nom du commerce" htmlFor="businessName" error={errors.businessName}>
        <Input
          id="businessName"
          name="businessName"
          placeholder="Le Tacos d'Yvan"
          autoComplete="organization"
          required
        />
      </Field>

      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="vous@commerce.fr"
          autoComplete="email"
          required
        />
      </Field>

      <Field
        label="Mot de passe"
        htmlFor="password"
        hint="8 caractères minimum"
        error={errors.password}
      >
        <div className="relative group">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-900 transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>


      <Button type="submit" variant="accent" size="lg" fullWidth loading={loading}>
        Créer mon Localia
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-cream-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-cream-50 px-2 text-ink-400">Ou continuer avec</span>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="lg"
        fullWidth
        onClick={handleGoogleLogin}
        loading={googleLoading}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        S'inscrire avec Google
      </Button>

      <p className="text-xs text-ink-300 text-center mt-4">
        En continuant, vous acceptez nos CGV et notre politique de confidentialité.
      </p>
    </form>
  );
}
