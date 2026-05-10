import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">Réinitialisation</h1>
        <p className="text-ink-400">
          Entrez le code reçu par email et votre nouveau mot de passe.
        </p>
      </div>
      
      <ResetPasswordForm />
      
      <div className="text-center">
        <Link href={ROUTES.login} className="text-sm font-medium text-moss-600 hover:text-moss-500">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
