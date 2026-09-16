import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Use your actual private key from Firebase Console
  // For now, create a placeholder that will be replaced during deployment
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  
  // Parse private key - handle both escaped and unescaped formats
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || ''
  
  // Remove quotes if present
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  
  // Replace escaped newlines
  privateKey = privateKey.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[v0] Missing Firebase credentials')
    throw new Error(
      'Firebase credentials missing. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY'
    )
  }

  try {
    const serviceAccount = {
      projectId,
      clientEmail,
      privateKey,
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    })
    console.log('[v0] Firebase Admin SDK initialized successfully')
  } catch (error: any) {
    console.error('[v0] Firebase Admin initialization error:', error.message)
    throw error
  }
}

export default admin
