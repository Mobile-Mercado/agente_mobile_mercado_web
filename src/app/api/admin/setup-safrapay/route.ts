import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

/**
 * Endpoint para configurar Safrapay em um estabelecimento
 * POST /api/admin/setup-safrapay
 * 
 * Body:
 * {
 *   adminSecret: string,
 *   establishmentId: string,
 *   safrapayConfig: {
 *     enabled: boolean,
 *     merchantId?: string,
 *     accessToken?: string,
 *     webhookSecret?: string,
 *     environment: "hml" | "prod"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminSecret, establishmentId, safrapayConfig } = body;

    // Validar admin secret
    const correctSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || adminSecret !== correctSecret) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 401 }
      );
    }

    if (!establishmentId || !safrapayConfig) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios faltando" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Firebase Admin nÃ£o configurado no servidor" },
        { status: 500 }
      );
    }

    // Atualizar documento no Firestore usando Admin SDK
    await db.collection("estabelecimentos").doc(establishmentId).update({
      safrapay: safrapayConfig,
    });

    return NextResponse.json({
      success: true,
      message: `Safrapay configurado para ${establishmentId}`,
      config: safrapayConfig,
    });
  } catch (error) {
    console.error("Erro ao configurar Safrapay:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}
