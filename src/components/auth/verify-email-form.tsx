"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";
import { ROUTES } from "@/config/routes";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize from URL params
  useEffect(() => {
    const e = searchParams.get("email");
    const b = searchParams.get("businessName");
    const status = searchParams.get("insforge_status");
    const type = searchParams.get("insforge_type");

    if (e) setEmail(e);
    if (b) setBusinessName(b);

    // Si on vient d'un lien de vérification réussi (Magic Link)
    if (type === "verify_email" && status === "success") {
       toast.success("Email vérifié avec succès ! Redirection...");
       setTimeout(() => {
         window.location.assign(ROUTES.dashboard);
       }, 1000);
    }

    // Focus le premier input au chargement
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, [searchParams]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Seulement des chiffres

    const newCode = [...code];
    newCode[index] = value.slice(-1); // On garde seulement le dernier caractère
    setCode(newCode);

    // Focus le prochain input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6).split("");
    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (/^\d$/.test(char)) {
        newCode[i] = char;
      }
    });
    setCode(newCode);
    
    // Focus le dernier input rempli ou le suivant
    const lastIndex = Math.min(pastedData.length, 5);
    inputs.current[lastIndex]?.focus();
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      toast.error("Veuillez entrer le code à 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      // On utilise notre nouvelle route API centralisée
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: fullCode,
          businessName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error?.message || "Code invalide ou expiré.");
        setLoading(false);
        return;
      }

      toast.success("Compte vérifié ! Bienvenue chez Localia.");
      // Utilisation de assign pour forcer un rechargement propre et la lecture des nouveaux cookies
      window.location.assign(ROUTES.dashboard);

    } catch (err) {
      console.error("[VerifyEmail] Error:", err);
      toast.error("Une erreur est survenue lors de la vérification.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="text-sm text-ink-400">Code envoyé à</span>
        <p className="font-medium text-ink-900">{email || "votre email"}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="flex justify-between gap-2 sm:gap-4">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 border-cream-200 bg-white text-ink-900 focus:border-moss-500 focus:ring-4 focus:ring-moss-100 transition-all outline-none shadow-sm"
            />
          ))}
        </div>

        <div className="space-y-4">
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Vérifier mon compte
          </Button>
          
          <button
            type="button"
            onClick={async () => {
              if (!email) return;
              toast.promise(
                (insforge.auth as any).resendVerificationEmail?.({ email }) || 
                Promise.resolve({ error: null }),
                {
                  loading: "Envoi d'un nouveau code...",
                  success: "Un nouveau code a été envoyé !",
                  error: "Erreur lors de l'envoi du code.",
                }
              );
            }}
            className="w-full text-sm text-ink-400 hover:text-ink-900 transition-colors font-medium"
          >
            Je n'ai pas reçu de code ? Renvoyer
          </button>
        </div>
      </form>

      <div className="pt-4 border-t border-cream-100">
        <button
          type="button"
          onClick={() => router.push(ROUTES.login)}
          className="w-full text-sm text-ink-400 hover:text-ink-900 transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}
