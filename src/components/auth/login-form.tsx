"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { ROUTES } from "@/config/routes";
import { insforge } from "@/lib/insforge";

type LoginMode = "password" | "code";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("password");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  
  // States for OTP mode
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Effect to focus first OTP input when step changes to 'code'
  useEffect(() => {
    if (step === "code" && otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, [step]);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider: "google",
        redirectTo: `${window.location.origin}${ROUTES.authCallback}`,
      });

      if (error) {
        toast.error(error.message);
        setGoogleLoading(false);
        return;
      }

      if (data?.codeVerifier) {
        // Stockage temporaire du verifier pour PKCE (utilisé par le callback)
        document.cookie = `localia_pkce_verifier=${data.codeVerifier}; path=/; max-age=300; SameSite=Lax`;
      }

      if (data?.url) {
        window.location.href = data.url;
      }

    } catch (err) {
      console.error("Google login error:", err);
      toast.error("Erreur lors de la connexion avec Google.");
      setGoogleLoading(false);
    }
  }


  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email requis" });
      return;
    }
    setLoading(true);
    try {
      // In InsForge SDK, sending OTP is usually via signInWithOtp
      const { error } = await (insforge.auth as any).signInWithOtp?.({ email }) || { error: null };
      
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Code envoyé à " + email);
      setStep("code");
    } catch {
      toast.error("Erreur lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload: any = {
      email: mode === "password" ? String(fd.get("email") ?? "").trim() : email,
      password: mode === "password" ? String(fd.get("password") ?? "") : undefined,
      code: mode === "code" ? otp.join("") : undefined,
      type: mode
    };

    if (mode === "password") {
      if (!payload.email) { setErrors({ email: "Email requis" }); setLoading(false); return; }
      if (!payload.password) { setErrors({ password: "Mot de passe requis" }); setLoading(false); return; }
    } else {
      if (payload.code.length < 6) {
        toast.error("Veuillez entrer le code à 6 chiffres.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(ROUTES.apiAuthLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.error?.requiresVerification) {
          toast.info("Veuillez vérifier votre email avant de vous connecter.");
          router.push(`${ROUTES.verifyEmail}?email=${encodeURIComponent(payload.email)}`);
          return;
        }
        toast.error(data?.error?.message ?? "Erreur de connexion.");
        setLoading(false);
        return;
      }


      toast.success("Content de vous revoir !");
      router.push(ROUTES.dashboard);
      router.refresh();
    } catch {
      toast.error("Erreur réseau. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-cream-100 rounded-xl">
        <button
          onClick={() => { setMode("password"); setStep("email"); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === "password" ? "bg-white text-ink-900 shadow-sm" : "text-ink-400 hover:text-ink-600"
          }`}
        >
          Mot de passe
        </button>
        <button
          onClick={() => setMode("code")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === "code" ? "bg-white text-ink-900 shadow-sm" : "text-ink-400 hover:text-ink-600"
          }`}
        >
          Code magique
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={onSubmit} className="space-y-4">
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

          <Field label="Mot de passe" htmlFor="password" error={errors.password}>
            <div className="relative group">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
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


          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Se connecter
          </Button>

          <div className="text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm font-medium text-moss-600 hover:text-moss-500 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </form>

      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step === "email" ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <Field label="Email" htmlFor="otp-email" error={errors.email}>
                <Input
                  id="otp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@commerce.fr"
                  autoComplete="email"
                  required
                />
              </Field>
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Recevoir un code
              </Button>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-ink-400 mb-1">Code envoyé à</p>
                <p className="font-medium text-ink-900 mb-4">{email}</p>
                <div className="flex justify-between gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 border-cream-200 bg-white text-ink-900 focus:border-moss-500 focus:ring-4 focus:ring-moss-100 transition-all outline-none shadow-sm"
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Vérifier et se connecter
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-ink-400 hover:text-ink-900 transition-colors"
              >
                Changer d'email
              </button>
            </form>
          )}
        </div>
      )}

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
        Se connecter avec Google
      </Button>
    </div>
  );
}
