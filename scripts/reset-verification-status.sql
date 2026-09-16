-- Reset all verification status to false
-- This ensures users need to complete the verification process

UPDATE profiles
SET 
  is_nid_verified = false,
  face_verified = false,
  nid_verified_at = NULL,
  face_verified_at = NULL
WHERE true;

-- Verify the update
SELECT phone, is_nid_verified, face_verified, nid_verified_at, face_verified_at 
FROM profiles 
LIMIT 10;
