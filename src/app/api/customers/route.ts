import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/get-viewer";
import { getAuthenticatedClient } from "@/server/db/client";
import { TABLES } from "@/server/db/tables";
import { mapCustomer, mapCustomerCard, mapLoyaltyCard } from "@/server/db/mappers";
import { ApiError, handleApiError } from "@/server/http/api-error";
import { assertBusinessOwnership, getCurrentBusiness } from "@/server/services/ownership";
import { generateToken, isValidEmail, isValidPhone } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const viewer = await requireUser();
    const business = await getCurrentBusiness(viewer.id);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.trim();

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    let query = db
      .from(TABLES.customers)
      .select("*")
      .eq("business_id", business.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const result = await query;
    let rows = Array.isArray(result?.data) ? result.data : [];

    // Recherche basique côté serveur
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r: any) =>
        (r.first_name ?? "").toLowerCase().includes(s) ||
        (r.last_name ?? "").toLowerCase().includes(s) ||
        (r.email ?? "").toLowerCase().includes(s) ||
        (r.phone ?? "").includes(s)
      );
    }

    return NextResponse.json({ data: rows.map(mapCustomer) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = await requireUser();
    const body = await req.json();

    const businessId = String(body?.businessId ?? "").trim();
    const business = businessId
      ? await assertBusinessOwnership(viewer.id, businessId)
      : await getCurrentBusiness(viewer.id);

    const firstName = String(body?.firstName ?? "").trim().slice(0, 120);
    const lastName = String(body?.lastName ?? "").trim().slice(0, 120) || null;
    const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 255) || null;
    const phone = String(body?.phone ?? "").trim().slice(0, 40) || null;

    if (!firstName) throw new ApiError("MISSING_FIRST_NAME", "Prénom requis.", 400);
    if (!email && !phone) {
      throw new ApiError("MISSING_CONTACT", "Email ou téléphone requis.", 400);
    }
    if (email && !isValidEmail(email)) {
      throw new ApiError("INVALID_EMAIL", "Email invalide.", 400);
    }
    if (phone && !isValidPhone(phone)) {
      throw new ApiError("INVALID_PHONE", "Téléphone invalide.", 400);
    }

    const client = await getAuthenticatedClient();
    const db: any = (client as any).database ?? client;

    // Créer le client
    const customerR = await db
      .from(TABLES.customers)
      .insert({
        business_id: business.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        birthday: body?.birthday ?? null,
        consent_marketing: Boolean(body?.consentMarketing),
        consent_at: body?.consentMarketing ? new Date().toISOString() : null,
        source: String(body?.source ?? "DASHBOARD").slice(0, 40),
        notes: body?.notes ?? null,
      })
      .select("*");

    const customerRows = Array.isArray(customerR?.data) ? customerR.data : [];
    if (customerRows.length === 0) throw new ApiError("CREATE_FAILED", "Création client impossible.", 500);
    const customer = mapCustomer(customerRows[0]);

    // Si un loyaltyCardId est fourni, créer la customer_card
    let customerCard = null;
    let program = null;
    if (body?.loyaltyCardId) {
      const progR = await db
        .from(TABLES.loyaltyCards)
        .select("*")
        .eq("id", body.loyaltyCardId)
        .eq("business_id", business.id)
        .limit(1);
      const progRows = Array.isArray(progR?.data) ? progR.data : [];
      if (progRows.length > 0) {
        program = mapLoyaltyCard(progRows[0]);
        const ccR = await db
          .from(TABLES.customerCards)
          .insert({
            customer_id: customer.id,
            business_id: business.id,
            loyalty_card_id: program.id,
            public_token: generateToken(16),
          })
          .select("*");
        const ccRows = Array.isArray(ccR?.data) ? ccR.data : [];
        if (ccRows.length > 0) customerCard = mapCustomerCard(ccRows[0]);
      }
    }

    return NextResponse.json({
      data: { customer, customerCard, program },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
