import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Mot de passe oublié ?</h1>
        <p className="text-ink-400">
          Entrez votre adresse email pour recevoir un code de réinitialisation.
        </p>
      </div>
      
      <ForgotPasswordForm />
      
      <div className="text-center">
        <Link href={ROUTES.login} className="text-sm font-medium text-moss-600 hover:text-moss-500">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
