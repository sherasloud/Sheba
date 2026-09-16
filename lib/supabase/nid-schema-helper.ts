/**
 * NID Verification Schema Helper
 * 
 * This file provides guidance for ensuring the Supabase schema has NID fields.
 * These fields need to be added to your profiles table in Supabase.
 * 
 * Required SQL to run in Supabase SQL Editor:
 * 
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nid_number VARCHAR(20);
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_nid_verified BOOLEAN DEFAULT FALSE;
 * ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nid_verified_at TIMESTAMP;
 * 
 * If you need to update existing profiles:
 * UPDATE profiles SET is_nid_verified = FALSE WHERE is_nid_verified IS NULL;
 */

import { createClient } from "./client"

export async function ensureNIDFieldsExist(): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Try to select the NID fields to check if they exist
    const { error } = await supabase
      .from("profiles")
      .select("nid_number, is_nid_verified, nid_verified_at")
      .limit(1)
    
    if (error) {
      console.error("[v0] NID fields may not exist:", error.message)
      console.log("[v0] Please run the SQL migrations in Supabase dashboard")
      return false
    }
    
    return true
  } catch (error) {
    console.error("[v0] Error checking NID fields:", error)
    return false
  }
}

export const NID_SCHEMA_SQL = `
-- Add NID verification columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nid_number VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_nid_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nid_verified_at TIMESTAMP WITH TIME ZONE;

-- Optional: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_nid_verified ON profiles(is_nid_verified);
`
