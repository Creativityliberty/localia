import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Créer mon compte",
};

export default function SignupPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-ink-900 tracking-tight mb-2">
        Créez votre Localia
      </h1>
      <p className="text-ink-400 mb-8 text-pretty">
        Démarrez votre mini-système client. Aucune carte bancaire requise.
      </p>

      <SignupForm />

      <p className="text-sm text-ink-400 text-center mt-6">
        Déjà un compte ?{" "}
        <Link href={ROUTES.login} className="text-ink-900 font-medium underline underline-offset-4 hover:text-moss-700">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
