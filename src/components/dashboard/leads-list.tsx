"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, Inbox, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/config/routes";
import { formatRelativeTime } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types/business";

const STATUS_FILTERS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "Nouvelles", value: "new" },
  { label: "Lues", value: "read" },
  { label: "Contactées", value: "contacted" },
  { label: "Converties", value: "converted" },
  { label: "Archivées", value: "archived" },
];

const STATUS_LABEL: Record<LeadStatus, { label: string; variant: "accent" | "default" | "success" | "warning" }> = {
  new: { label: "Nouveau", variant: "accent" },
  read: { label: "Lu", variant: "default" },
  contacted: { label: "Contacté", variant: "warning" },
  converted: { label: "Converti", variant: "success" },
  archived: { label: "Archivé", variant: "default" },
  spam: { label: "Spam", variant: "default" },
};

export function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    const url = new URL(ROUTES.apiLeads, window.location.origin);
    if (filter !== "all") url.searchParams.set("status", filter);

    fetch(url.toString())
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        setLeads(res?.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        toast.error("Erreur lors du chargement.");
        setLoading(false);
      });

    return () => { active = false; };
  }, [filter]);

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (l.name ?? "").toLowerCase().includes(s) ||
      (l.email ?? "").toLowerCase().includes(s) ||
      (l.phone ?? "").includes(s) ||
      l.message.toLowerCase().includes(s) ||
      (l.serviceRequested ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-ink-900 text-cream-50"
                  : "bg-white text-ink-500 border border-cream-300 hover:border-cream-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-cream-50 border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title={search ? "Aucune demande ne correspond" : "Aucune demande pour l'instant"}
          description="Dès qu'un visiteur enverra une demande via votre site ou cliquera sur WhatsApp, elle apparaîtra ici. En attendant, partagez votre QR code et votre lien pour augmenter le trafic."
          primaryAction={!search ? { label: "Créer un QR code", href: ROUTES.dashboardQr } : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => {
            const statusInfo = STATUS_LABEL[lead.status];
            return (
              <Link
                key={lead.id}
                href={ROUTES.dashboardLead(lead.id)}
                className="flex items-start gap-4 p-4 rounded-xl bg-white border border-cream-300 hover:border-moss-300 hover:shadow-soft transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-moss-50 text-moss-700 flex items-center justify-center font-display text-sm flex-shrink-0">
                  {(lead.name ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-ink-900">{lead.name ?? "Anonyme"}</span>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    {lead.serviceRequested && (
                      <Badge variant="outline">{lead.serviceRequested}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-ink-500 line-clamp-1 mb-1.5">{lead.message}</p>
                  <div className="flex items-center gap-4 text-xs text-ink-400">
                    {lead.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {lead.email}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-ink-300 flex-shrink-0 whitespace-nowrap">
                  {formatRelativeTime(lead.createdAt)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
