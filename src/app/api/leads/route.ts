import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(3),
  whatsapp: z.string().min(10),
  vehicle_id: z.string(), // Allow mock IDs (non-UUID)
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = leadSchema.parse(body);
    const supabase = await createClient();

    let sellerId: string | null = null;
    let finalVehicleId: string | null = null;

    const isMock = validatedData.vehicle_id.startsWith("mock-");

    if (isMock) {
      // For mock vehicles, try to assign to the first available seller or leave null
      const { data: firstSeller } = await supabase.from("sellers").select("id").limit(1).maybeSingle();
      sellerId = firstSeller?.id || null;
      finalVehicleId = null; // Cannot link mock ID to vehicles table FK
    } else {
      // Real vehicle: fetch seller_id
      const { data: vehicle, error: vError } = await supabase
        .from("vehicles")
        .select("seller_id")
        .eq("id", validatedData.vehicle_id)
        .single();
      
      if (vError || !vehicle) {
        // Fallback: maybe it was recently deleted or it's a desync
        const { data: firstSeller } = await supabase.from("sellers").select("id").limit(1).maybeSingle();
        sellerId = firstSeller?.id || null;
      } else {
        sellerId = vehicle.seller_id;
        finalVehicleId = validatedData.vehicle_id;
      }
    }

    // Insert lead
    const { error: lError } = await supabase
      .from("leads")
      .insert({
        customer_name: validatedData.name,
        customer_whatsapp: validatedData.whatsapp,
        vehicle_id: finalVehicleId, // Will be null for mocks
        seller_id: sellerId,
        notes: validatedData.message + (isMock ? `\n(Interesse no veículo mock: ${validatedData.vehicle_id})` : ""),
        status: "novo",
      });

    if (lError) {
      console.error("Supabase Error saving lead:", lError);
      return NextResponse.json({ error: "Erro ao salvar lead no banco de dados" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Unhandled Error in /api/leads:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
