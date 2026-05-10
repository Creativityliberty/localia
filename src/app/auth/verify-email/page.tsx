import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata = {
  title: "Vérification de l'email",
};

export default function VerifyEmailPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-ink-900 tracking-tight mb-2 text-center">
        Vérifiez votre email
      </h1>
      <p className="text-ink-400 mb-10 text-center text-pretty max-w-sm mx-auto">
        Nous venons de vous envoyer un code de vérification à 6 chiffres.
      </p>

      <Suspense fallback={<div className="h-16 animate-pulse bg-cream-100 rounded-xl" />}>
        <VerifyEmailForm />
      </Suspense>

      <div className="mt-10 p-6 bg-moss-50 rounded-2xl border border-moss-100">
        <p className="text-sm text-moss-900 leading-relaxed text-center">
          <strong>Pensez à regarder vos spams</strong> si vous ne trouvez pas le message d'ici quelques minutes.
        </p>
      </div>
    </div>
  );
}
