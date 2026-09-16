import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const TRUECALLER_APP_KEY = process.env.TRUECALLER_APP_KEY || "asc6W4c5449ab515e4116918a30e4603f7dda";

/**
 * Generate a request nonce for Truecaller verification
 * This nonce will be used to correlate the callback response
 */
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number required",
        },
        { status: 400 }
      );
    }

    // Generate unique request nonce
    const requestNonce = crypto.randomBytes(16).toString("base64").replace(/[+/=]/g, "");

    console.log("[v0] Truecaller initialization:", {
      phone,
      requestNonce,
      appKey: TRUECALLER_APP_KEY.slice(0, 8) + "...",
    });

    // Store request nonce in session or cache for verification
    // In production, you'd want to store this with an expiration
    const requestData = {
      requestNonce,
      phone,
      timestamp: Date.now(),
      appKey: TRUECALLER_APP_KEY,
    };

    return NextResponse.json({
      success: true,
      requestNonce,
      appKey: TRUECALLER_APP_KEY,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://shebabangladesh.vercel.app"}/api/truecaller/webhook`,
      requestData: JSON.stringify(requestData),
    });
  } catch (error) {
    console.error("[v0] Truecaller init error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Initialization failed",
      },
      { status: 500 }
    );
  }
}
