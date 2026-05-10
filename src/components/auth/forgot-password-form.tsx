"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { insforge } from "@/lib/insforge";
import { ROUTES } from "@/config/routes";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await insforge.auth.sendResetPasswordEmail({ email });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("E-mail de réinitialisation envoyé !");
        router.push(`${ROUTES.resetPassword}?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      toast.error("Erreur lors de l'envoi de l'e-mail.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.fr"
          required
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        Envoyer le lien
      </Button>
    </form>
  );
}
