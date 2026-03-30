import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(3),
  whatsapp: z.string().min(10),
  vehicle_id: z.string().uuid(),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = leadSchema.parse(body);
    const supabase = await createClient();

    // Fetch vehicle to get seller_id
    const { data: vehicle, error: vError } = await supabase
      .from("vehicles")
      .select("seller_id")
      .eq("id", validatedData.vehicle_id)
      .single();

    if (vError || !vehicle) {
      return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });
    }

    // Insert lead
    const { error: lError } = await supabase
      .from("leads")
      .insert({
        customer_name: validatedData.name,
        customer_whatsapp: validatedData.whatsapp,
        vehicle_id: validatedData.vehicle_id,
        seller_id: vehicle.seller_id,
        notes: validatedData.message,
        status: "novo",
      });

    if (lError) {
      console.error("Supabase Error:", lError);
      return NextResponse.json({ error: "Erro ao salvar lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
