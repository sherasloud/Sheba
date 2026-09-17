import { processTruecallerCallback, handleTruecallerRejection } from "@/lib/services/truecaller-integration";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Truecaller webhook received");

    const body = await request.json();
    console.log("[v0] Webhook body:", { requestId: body.requestId, hasAccessToken: !!body.accessToken });

    // Handle user rejection
    if (body.status === "user_rejected") {
      await handleTruecallerRejection(body.requestId);
      return NextResponse.json({
        success: true,
        message: "User rejected verification",
      });
    }

    // Handle successful verification
    if (body.accessToken && body.endpoint) {
      const result = await processTruecallerCallback({
        requestId: body.requestId,
        accessToken: body.accessToken,
        endpoint: body.endpoint,
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          phoneNumber: result.phoneNumber,
          exists: result.exists,
          message: "User verified successfully",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid callback data",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[v0] Truecaller webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
