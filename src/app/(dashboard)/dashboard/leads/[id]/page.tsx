import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MessageSquare } from "lucide-react";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapLead } from "@/server/db/mappers";
import { assertBusinessOwnership } from "@/server/services/ownership";
import { LeadDetailActions } from "@/components/dashboard/lead-detail-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";
import { buildPhoneLink, buildWhatsAppLink, formatRelativeTime } from "@/lib/utils";

interface Params { params: Promise<{ id: string }>; }
export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: Params) {
  const viewer = await requireUser();
  const { id } = await params;

  const client = await getAuthenticatedClient();
  const db: any = (client as any).database ?? client;
  const result = await db.from(TABLES.leads).select("*").eq("id", id).limit(1);
  const rows = Array.isArray(result?.data) ? result.data : [];
  if (rows.length === 0) notFound();

  const lead = mapLead(rows[0]);
  await assertBusinessOwnership(viewer.id, lead.businessId);

  // Auto-marquer comme lu si nouveau
  if (lead.status === "new") {
    await db.from(TABLES.leads).update({ status: "read" }).eq("id", id);
    lead.status = "read";
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Link
        href={ROUTES.dashboardLeads}
        className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux demandes
      </Link>

      <div className="rounded-2xl bg-white border border-cream-300 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start gap-5 mb-6 pb-6 border-b border-cream-200">
          <div className="h-14 w-14 rounded-2xl bg-moss-50 text-moss-700 flex items-center justify-center font-display text-xl flex-shrink-0">
            {(lead.name ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-display text-2xl tracking-tight text-ink-900">
                {lead.name ?? "Demande anonyme"}
              </h1>
              <Badge variant="outline">{lead.status}</Badge>
            </div>
            <p className="text-xs text-ink-400">
              Reçue {formatRelativeTime(lead.createdAt)}
              {lead.source && ` · via ${lead.source}`}
            </p>
          </div>
        </div>

        {/* Contact actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
          {lead.phone && (
            <Button asChild variant="ghost" size="md" fullWidth>
              <a href={buildWhatsAppLink(lead.phone, `Bonjour ${lead.name ?? ""}, suite à votre demande sur notre site…`)} target="_blank" rel="noopener">
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
          )}
          {lead.phone && (
            <Button asChild variant="ghost" size="md" fullWidth>
              <a href={buildPhoneLink(lead.phone)}>
                <Phone className="h-4 w-4" /> Appeler
              </a>
            </Button>
          )}
          {lead.email && (
            <Button asChild variant="ghost" size="md" fullWidth>
              <a href={`mailto:${lead.email}`}>
                <Mail className="h-4 w-4" /> Email
              </a>
            </Button>
          )}
        </div>

        {/* Message */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-2">Message</h2>
            <div className="rounded-xl bg-cream-50 p-4 text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
              {lead.message}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {lead.email && (
              <div>
                <div className="text-xs text-ink-400 mb-0.5">Email</div>
                <div className="text-ink-900 break-all">{lead.email}</div>
              </div>
            )}
            {lead.phone && (
              <div>
                <div className="text-xs text-ink-400 mb-0.5">Téléphone</div>
                <div className="text-ink-900">{lead.phone}</div>
              </div>
            )}
            {lead.serviceRequested && (
              <div>
                <div className="text-xs text-ink-400 mb-0.5">Service demandé</div>
                <div className="text-ink-900">{lead.serviceRequested}</div>
              </div>
            )}
            {lead.utmSource && (
              <div>
                <div className="text-xs text-ink-400 mb-0.5">Source</div>
                <div className="text-ink-900">{lead.utmSource} {lead.utmCampaign ? `· ${lead.utmCampaign}` : ""}</div>
              </div>
            )}
          </div>
        </div>

        {/* Status actions (client) */}
        <div className="mt-6 pt-6 border-t border-cream-200">
          <LeadDetailActions lead={lead} />
        </div>
      </div>
    </div>
  );
}
