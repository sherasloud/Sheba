import { db } from "@/lib/db";
import { appUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TRUECALLER_APP_KEY = process.env.TRUECALLER_APP_KEY || "asc6W4c5449ab515e4116918a30e4603f7dda";
const TRUECALLER_PROFILE_ENDPOINT = "https://profile4-noneu.truecaller.com/v1/default";

export interface TruecallerProfile {
  id: string;
  userId: string;
  phoneNumbers: string[];
  name: {
    first: string;
    last: string;
  };
  avatarUrl?: string;
  email?: string;
  isActive: boolean;
}

export interface TruecallerCallbackData {
  requestId: string;
  accessToken: string;
  endpoint: string;
}

export interface TruecallerUserReject {
  requestId: string;
  status: "user_rejected";
}

/**
 * Fetch user profile from Truecaller using access token
 */
export async function getTruecallerProfile(
  accessToken: string,
  endpoint: string
): Promise<TruecallerProfile | null> {
  try {
    console.log("[v0] Fetching Truecaller profile from:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      console.error("[v0] Truecaller profile fetch failed:", response.status);
      return null;
    }

    const profile = (await response.json()) as TruecallerProfile;
    console.log("[v0] Truecaller profile fetched:", {
      id: profile.id,
      phone: profile.phoneNumbers?.[0],
      name: `${profile.name.first} ${profile.name.last}`,
    });

    return profile;
  } catch (error) {
    console.error("[v0] Error fetching Truecaller profile:", error);
    return null;
  }
}

/**
 * Process Truecaller callback and create/update user
 */
export async function processTruecallerCallback(data: TruecallerCallbackData): Promise<{
  success: boolean;
  phoneNumber?: string;
  exists?: boolean;
  error?: string;
}> {
  try {
    console.log("[v0] Processing Truecaller callback for requestId:", data.requestId);

    // Fetch user profile
    const profile = await getTruecallerProfile(data.accessToken, data.endpoint);

    if (!profile || !profile.phoneNumbers || profile.phoneNumbers.length === 0) {
      console.error("[v0] No phone numbers in Truecaller profile");
      return {
        success: false,
        error: "No phone number found in profile",
      };
    }

    const phoneNumber = profile.phoneNumbers[0];
    const countryCode = phoneNumber.startsWith("+880") ? "+880" : phoneNumber.startsWith("880") ? "+880" : "+88";
    const normalizedPhone = phoneNumber.replace(/^\+?880/, "01");

    console.log("[v0] Processing phone:", normalizedPhone);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.phone, normalizedPhone))
      .limit(1);

    const userExists = existingUser.length > 0;

    // If new user, create account
    if (!userExists) {
      const firstName = profile.name?.first || "";
      const lastName = profile.name?.last || "";
      const fullName = `${firstName} ${lastName}`.trim();

      await db.insert(appUsers).values({
        phone: normalizedPhone,
        name: fullName || "User",
        verified: true,
        truecallerId: profile.id,
        truecallerUserId: profile.userId,
        avatar: profile.avatarUrl,
        createdAt: new Date(),
        balance: 0,
        status: "active",
      });

      console.log("[v0] New user created via Truecaller:", normalizedPhone);
    } else {
      // Update existing user with Truecaller data
      await db
        .update(appUsers)
        .set({
          verified: true,
          truecallerId: profile.id,
          truecallerUserId: profile.userId,
          avatar: profile.avatarUrl || existingUser[0].avatar,
        })
        .where(eq(appUsers.phone, normalizedPhone));

      console.log("[v0] Existing user updated with Truecaller data:", normalizedPhone);
    }

    return {
      success: true,
      phoneNumber: normalizedPhone,
      exists: userExists,
    };
  } catch (error) {
    console.error("[v0] Error processing Truecaller callback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Handle user rejection
 */
export async function handleTruecallerRejection(requestId: string): Promise<void> {
  console.log("[v0] User rejected Truecaller verification:", requestId);
  // Store rejection event if needed
}

/**
 * Generate Truecaller request link for client
 */
export function generateTruecallerRequestLink(requestNonce: string, countryCode: string = "BD"): string {
  // This would be used in client-side to open Truecaller app
  // For web, Truecaller uses a callback-based approach
  const params = new URLSearchParams({
    requestNonce,
    countryCode,
  });

  return `truecaller://verify?${params.toString()}`;
}
