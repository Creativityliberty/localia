import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-ink-900 tracking-tight mb-2">
        Bon retour
      </h1>
      <p className="text-ink-400 mb-8">
        Connectez-vous à votre dashboard Localia.
      </p>

      <LoginForm />

      <p className="text-sm text-ink-400 text-center mt-6">
        Pas encore de compte ?{" "}
        <Link href={ROUTES.signup} className="text-ink-900 font-medium underline underline-offset-4 hover:text-moss-700">
          Créer mon Localia
        </Link>
      </p>
    </div>
  );
}
