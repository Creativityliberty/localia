"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Check } from "lucide-react";

interface LeadFormProps {
  businessId: string;
  siteId: string;
  /** Couleurs pour s'adapter au thème du site */
  colors?: {
    primary: string;
    accent: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
  };
  radius?: string;
}

export function LeadForm({ businessId, siteId, colors, radius = "16px" }: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const c = colors ?? {
    primary: "#1B3D0A",
    accent: "#A6FF4D",
    surface: "#FFFFFF",
    textPrimary: "#111611",
    textSecondary: "#5E6B5B",
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const url = new URL(window.location.href);

    const payload = {
      businessId,
      siteId,
      name: String(fd.get("name") ?? "").trim() || null,
      email: String(fd.get("email") ?? "").trim() || null,
      phone: String(fd.get("phone") ?? "").trim() || null,
      message: String(fd.get("message") ?? "").trim(),
      serviceRequested: String(fd.get("serviceRequested") ?? "").trim() || null,
      consentMarketing: fd.get("consent") === "on",
      source: "site",
      utmSource: url.searchParams.get("utm_source"),
      utmMedium: url.searchParams.get("utm_medium"),
      utmCampaign: url.searchParams.get("utm_campaign"),
    };

    if (!payload.message || payload.message.length < 2) {
      setErrors({ message: "Message requis" });
      setLoading(false);
      return;
    }
    if (!payload.email && !payload.phone) {
      setErrors({ email: "Email ou téléphone requis" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ message: data?.error?.message ?? "Erreur" });
        toast.error(data?.error?.message ?? "Erreur");
        return;
      }
      setSubmitted(true);
      toast.success("Demande envoyée !");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="text-center py-8 px-6"
        style={{ borderRadius: radius, backgroundColor: c.surface }}
      >
        <div className="inline-flex h-14 w-14 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${c.accent}30` }}>
          <Check className="h-7 w-7" style={{ color: c.primary }} />
        </div>
        <h3 className="font-display text-2xl mb-2" style={{ color: c.primary }}>
          Demande envoyée !
        </h3>
        <p className="text-sm" style={{ color: c.textSecondary }}>
          On revient vers vous très vite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="text"
        name="name"
        placeholder="Votre prénom"
        autoComplete="given-name"
        className="w-full px-4 py-3 text-sm focus:outline-none"
        style={{
          borderRadius: "12px",
          border: `1px solid ${c.textPrimary}20`,
          backgroundColor: "#FFFFFF",
          color: c.textPrimary,
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          className="px-4 py-3 text-sm focus:outline-none"
          style={{
            borderRadius: "12px",
            border: `1px solid ${errors.email ? "#E85B5B" : c.textPrimary + "20"}`,
            backgroundColor: "#FFFFFF",
            color: c.textPrimary,
          }}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Téléphone"
          autoComplete="tel"
          className="px-4 py-3 text-sm focus:outline-none"
          style={{
            borderRadius: "12px",
            border: `1px solid ${c.textPrimary}20`,
            backgroundColor: "#FFFFFF",
            color: c.textPrimary,
          }}
        />
      </div>
      <textarea
        name="message"
        placeholder="Votre demande..."
        rows={3}
        required
        className="w-full px-4 py-3 text-sm focus:outline-none resize-y"
        style={{
          borderRadius: "12px",
          border: `1px solid ${errors.message ? "#E85B5B" : c.textPrimary + "20"}`,
          backgroundColor: "#FFFFFF",
          color: c.textPrimary,
        }}
      />

      <label className="flex items-start gap-2 text-xs cursor-pointer" style={{ color: c.textSecondary }}>
        <input type="checkbox" name="consent" className="mt-0.5" />
        <span>Je souhaite recevoir les offres et nouveautés.</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-5 py-3.5 font-medium text-[15px] inline-flex items-center justify-center gap-2 transition-all"
        style={{
          borderRadius: "12px",
          backgroundColor: c.accent,
          color: c.primary,
          opacity: loading ? 0.6 : 1,
          boxShadow: `0 8px 20px ${c.accent}50`,
        }}
      >
        <Send className="h-4 w-4" />
        {loading ? "Envoi…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
