import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/db/mongodb'

export interface User {
  _id?: ObjectId
  phoneNumber: string
  pin: string
  fullName: string
  balance: number
  accountType: 'personal' | 'business'
  email?: string
  createdAt: Date
  updatedAt: Date
}

export class UserModel {
  private static collectionName = 'users'

  /**
   * Check if user exists by phone number
   */
  static async findByPhone(phoneNumber: string): Promise<User | null> {
    try {
      const collection = await getCollection(this.collectionName)
      const user = await collection.findOne({ phoneNumber })
      return user as User | null
    } catch (error) {
      console.error('[v0] Error finding user by phone:', error)
      throw error
    }
  }

  /**
   * Create new user
   */
  static async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const collection = await getCollection(this.collectionName)
      
      // Check if user already exists
      const existingUser = await this.findByPhone(userData.phoneNumber)
      if (existingUser) {
        throw new Error('User already exists')
      }

      const now = new Date()
      const result = await collection.insertOne({
        ...userData,
        createdAt: now,
        updatedAt: now,
      })

      return {
        _id: result.insertedId,
        ...userData,
        createdAt: now,
        updatedAt: now,
      }
    } catch (error) {
      console.error('[v0] Error creating user:', error)
      throw error
    }
  }

  /**
   * Update user PIN
   */
  static async updatePin(phoneNumber: string, pin: string): Promise<boolean> {
    try {
      const collection = await getCollection(this.collectionName)
      const result = await collection.updateOne(
        { phoneNumber },
        {
          $set: {
            pin,
            updatedAt: new Date(),
          },
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('[v0] Error updating PIN:', error)
      throw error
    }
  }

  /**
   * Verify PIN
   */
  static async verifyPin(phoneNumber: string, pin: string): Promise<boolean> {
    try {
      const user = await this.findByPhone(phoneNumber)
      if (!user) {
        return false
      }
      return user.pin === pin
    } catch (error) {
      console.error('[v0] Error verifying PIN:', error)
      throw error
    }
  }

  /**
   * Get user by phone
   */
  static async getUser(phoneNumber: string): Promise<User | null> {
    return this.findByPhone(phoneNumber)
  }

  /**
   * Update user balance
   */
  static async updateBalance(phoneNumber: string, balance: number): Promise<boolean> {
    try {
      const collection = await getCollection(this.collectionName)
      const result = await collection.updateOne(
        { phoneNumber },
        {
          $set: {
            balance,
            updatedAt: new Date(),
          },
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('[v0] Error updating balance:', error)
      throw error
    }
  }
}
