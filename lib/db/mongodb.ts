import { MongoClient, Db, ServerApiVersion } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })

  try {
    await client.connect()
    // Test connection with ping
    await client.db('admin').command({ ping: 1 })
    console.log('[v0] Connected to MongoDB successfully')
    
    const db = client.db('sheba')
    
    cachedClient = client
    cachedDb = db
    
    return { client, db }
  } catch (error) {
    console.error('[v0] MongoDB connection error:', error)
    throw error
  }
}

export async function getDatabase() {
  const { db } = await connectToDatabase()
  return db
}

export async function getCollection(collectionName: string) {
  const db = await getDatabase()
  return db.collection(collectionName)
}
