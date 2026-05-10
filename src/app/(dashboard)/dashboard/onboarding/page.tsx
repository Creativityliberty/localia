import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/get-viewer";
import { getCurrentBusiness } from "@/server/services/ownership";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { ROUTES } from "@/config/routes";

export const metadata = { title: "Bienvenue" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const viewer = await requireUser();
  let business;
  try {
    business = await getCurrentBusiness(viewer.id);
  } catch {
    redirect(ROUTES.dashboard);
  }
  return <OnboardingWizard business={business} />;
}
