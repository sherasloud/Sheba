import { pgTable, text, timestamp, boolean, bigint } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),

// Mobile money app tables
export const appUsers = pgTable('appUsers', {
  id: text('id').primaryKey(),
  phoneNumber: text('phoneNumber').notNull().unique(),
  fullName: text('fullName'),
  pin: text('pin'),
  balance: bigint('balance', { mode: 'number' }).default(0),
  accountType: text('accountType').default('personal'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const otps = pgTable('otps', {
  id: text('id').primaryKey(),
  phoneNumber: text('phoneNumber').notNull(),
  otp: text('otp').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  verified: boolean('verified').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Transaction history - প্রতিটি money transfer এর complete record
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userid: text('userid').notNull().references(() => appUsers.id, { onDelete: 'cascade' }),
  phonenumber: text('phonenumber').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  balanceBefore: bigint('balanceBefore', { mode: 'number' }),
  balanceAfter: bigint('balanceAfter', { mode: 'number' }),
  type: text('type').notNull(), // 'transfer', 'cashout', 'payment'
  status: text('status').default('completed'), // 'pending', 'completed', 'failed'
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Notifications - প্রতিটি user এর notification history
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  phonenumber: text('phonenumber').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'transfer', 'cashout', 'payment'
  isRead: boolean('isRead').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Institutions - School, College, University
export const institutions = pgTable('institutions', {
  id: text('id').primaryKey(),
  managerPhone: text('managerPhone').notNull().references(() => appUsers.phoneNumber),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'school', 'college', 'university'
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Classes/Grades - School: 1-10, College: 11-12, University: 1st-4th year
export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  institutionId: text('institutionId').notNull().references(() => institutions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Class 1", "11A", "1st Year"
  classLevel: bigint('classLevel', { mode: 'number' }).notNull(), // 1-10 for school, 11-12 for college, 13-16 for university
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Students
export const students = pgTable('students', {
  id: text('id').primaryKey(),
  classId: text('classId').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  institutionId: text('institutionId').notNull().references(() => institutions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  rollNo: text('rollNo'),
  parentPhone: text('parentPhone'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Fee Structure
export const feeStructures = pgTable('feeStructures', {
  id: text('id').primaryKey(),
  institutionId: text('institutionId').notNull().references(() => institutions.id, { onDelete: 'cascade' }),
  classId: text('classId').references(() => classes.id, { onDelete: 'cascade' }),
  feeAmount: bigint('feeAmount', { mode: 'number' }).notNull(),
  feeName: text('feeName').notNull(), // e.g., "Tuition Fee", "Monthly Fee"
  frequency: text('frequency').notNull(), // 'monthly', 'quarterly', 'yearly'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Student Fee Payments
export const feePayments = pgTable('feePayments', {
  id: text('id').primaryKey(),
  studentId: text('studentId').notNull().references(() => students.id, { onDelete: 'cascade' }),
  feeStructureId: text('feeStructureId').notNull().references(() => feeStructures.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  status: text('status').notNull(), // 'pending', 'paid', 'overdue'
  dueDate: timestamp('dueDate'),
  paidDate: timestamp('paidDate'),
  transactionId: text('transactionId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Healthcare Service Providers (Sheba) - Doctor, Lab, Physio, Hospital
export const serviceProviders = pgTable('serviceProviders', {
  id: text('id').primaryKey(),
  phone: text('phone').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'doctor', 'lab', 'physio', 'hospital', 'pharmacy'
  specialization: text('specialization'),
  address: text('address'),
  apiKey: text('apiKey').unique(), // Unique API key for Sheba
  verificationCode: text('verificationCode'),
  verificationCodeExpiry: timestamp('verificationCodeExpiry'),
  isVerified: boolean('isVerified').default(false),
  verifiedAt: timestamp('verifiedAt'),
  balance: bigint('balance', { mode: 'number' }).default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Service Requests & Payments
export const servicePayments = pgTable('servicePayments', {
  id: text('id').primaryKey(),
  userPhone: text('userPhone').notNull(),
  providerId: text('providerId').notNull().references(() => serviceProviders.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  description: text('description'),
  status: text('status').notNull(), // 'pending', 'completed', 'failed'
  transactionId: text('transactionId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
