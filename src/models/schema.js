import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  jsonb,
  integer,
  customType,
} from 'drizzle-orm/pg-core';

/**
 * Custom Drizzle type for PostgreSQL varchar array: varchar(50)[]
 */
export const varcharArray = customType({
  dataType() {
    return 'varchar(50)[]';
  },
});

/**
 * 1. Users Table
 * Tracks authentication, verification, and independent dual-role onboarding status (Seller & Buyer).
 */
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  mobile: varchar('mobile', { length: 15 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  role: varchar('role', { length: 30 }).default('USER').notNull(),
  onboarded: boolean('onboarded').default(false).notNull(),

  // Independent Dual-Role Onboarding & Payment Flags
  sellerOnboarded: boolean('seller_onboarded').default(false).notNull(),
  buyerOnboarded: boolean('buyer_onboarded').default(false).notNull(),
  sellerPaid: boolean('seller_paid').default(false).notNull(),
  buyerPaid: boolean('buyer_paid').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 2. Documents Table
 * Metadata for documents stored in Supabase Storage public bucket 'user_documents'.
 */
export const documents = pgTable('documents', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  storagePath: text('storage_path').notNull(),
  fileSize: numeric('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 30 }).default('UPLOADED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * 3. Buyer Profiles Table (Clean Unified Schema)
 * Supports all 7 dynamic buyer classifications with common queryable columns
 * and full category attributes in 'category_details' (JSONB).
 */
export const buyerProfiles = pgTable('buyer_profiles', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).unique().notNull(),
  buyerType: varchar('buyer_type', { length: 255 }).notNull(),
  buyerType: varchar('buyer_type', { length: 255 }).notNull(),

  // Unified Identity & Brand
  businessName: varchar('business_name', { length: 150 }),

  // Geographic Location
  district: varchar('district', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }),
  pinCode: varchar('pin_code', { length: 20 }),
  address: text('address'),

  // Compliance
  isGst: boolean('is_gst').default(false).notNull(),
  gstin: varchar('gstin', { length: 50 }),
  fssaiNumber: varchar('fssai_number', { length: 50 }),

  // Unified Discovery & Sourcing
  targetCommodities: text('target_commodities'),
  procurementVolume: varchar('procurement_volume', { length: 100 }),

  // Dynamic Full-Fidelity Category Attributes
  categoryDetails: jsonb('category_details').default({}).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 4. Seller Profiles Table (Clean Unified Schema)
 * Supports all 8 seller classifications with common queryable columns
 * and full category attributes in 'category_details' (JSONB).
 */
export const sellerProfiles = pgTable('seller_profiles', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),

  // Stores array of authoritative reference IDs from seller_categories (e.g. ['CAT-SEL-01', 'CAT-SEL-02'])
  sellerType: varcharArray('seller_type').notNull(),

  // Unified Identity & Brand
  businessName: varchar('business_name', { length: 150 }),

  // Common Operating Location
  district: varchar('district', { length: 100 }),
  village: varchar('village', { length: 100 }),
  pinCode: varchar('pin_code', { length: 20 }),
  farmAddress: text('farm_address'),

  // Compliance Flags & Registration Numbers
  isGst: boolean('is_gst').default(false).notNull(),
  gstin: varchar('gstin', { length: 50 }),
  fssaiNumber: varchar('fssai_number', { length: 50 }),

  // Dynamic Full-Fidelity Category Attributes
  categoryDetails: jsonb('category_details').default({}).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 5. Applications Table
 * Records submitted onboarding applications with full profile audit snapshot.
 */
export const applications = pgTable('applications', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).notNull(),
  role: varchar('role', { length: 30 }).notNull(),
  subType: varchar('sub_type', { length: 255 }).notNull(),
  subType: varchar('sub_type', { length: 255 }).notNull(),
  profilePayload: jsonb('profile_payload').default({}),
  documents: jsonb('documents'),
  overallStatus: varchar('overall_status', { length: 30 }).default('PENDING_REVIEW').notNull(),
  adminComments: text('admin_comments'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 6. Payments Table
 * Records onboarding payments and membership fees.
 */
export const payments = pgTable('payments', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id).notNull(),
  orderId: varchar('order_id', { length: 100 }).unique(),
  transactionId: varchar('transaction_id', { length: 100 }).unique(),
  amount: numeric('amount', { precision: 10, scale: 2 }).default('365.00').notNull(),
  amountPaise: integer('amount_paise'),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  role: varchar('role', { length: 30 }).default('SELLER').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).default('UPI').notNull(),
  plan: varchar('plan', { length: 255 }).notNull(),
  planId: varchar('plan_id', { length: 50 }).default('SELLER_ANNUAL'),
  metadata: jsonb('metadata').default({}),
  signature: text('signature'),
  status: varchar('status', { length: 30 }).default('CREATED').notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 7. OTP Verifications Table
 * Tracks email verification OTPs, SHA-256 hashes, expiration, and rate-limiting attempts.
 */
export const otpVerifications = pgTable('otp_verifications', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  otpHash: varchar('otp_hash', { length: 255 }).notNull(),
  otpType: varchar('otp_type', { length: 50 }).default('EMAIL_VERIFICATION').notNull(),
  resendAttempts: integer('resend_attempts').default(0).notNull(),
  lastResentAt: timestamp('last_resent_at').defaultNow().notNull(),
  verificationAttempts: integer('verification_attempts').default(0).notNull(),
  lastAttemptAt: timestamp('last_attempt_at'),
  status: varchar('status', { length: 30 }).default('PENDING').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 8. Membership Plans Table
 * Stores authoritative subscription and membership pricing tiers dynamically in Supabase PostgreSQL.
 */
export const membershipPlans = pgTable('membership_plans', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 30 }).default('SELLER').notNull(),
  priceInPaise: integer('price_in_paise').notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  durationDays: integer('duration_days').default(365).notNull(),
  description: text('description'),
  features: jsonb('features').default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 9. Seller Categories Table
 * Authoritative master taxonomy for seller classifications linked to membership plans via Foreign Key.
 */
export const sellerCategories = pgTable('seller_categories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  planId: varchar('plan_id', { length: 50 }).references(() => membershipPlans.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
  requiredDocuments: jsonb('required_documents').default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 10. Product Categories Table
 * Dynamic categories loaded from the database so Admins can add or update them.
 */
export const productCategories = pgTable('product_categories', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * 10. Products Table
 * Full agricultural product listings created by verified Sellers.
 * Supports complete lifecycle (Draft, Submitted, Under Review, Approved, Published, etc.),
 * multi-image gallery with primary selection, origin, MOQ, processing, dynamic attributes & certifications.
 */
export const products = pgTable('products', {
  id: varchar('id', { length: 64 }).primaryKey(),
  sellerId: varchar('seller_id', { length: 64 }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  productType: varchar('product_type', { length: 100 }),
  variety: varchar('variety', { length: 100 }),
  qualityGrade: varchar('quality_grade', { length: 50 }),
  size: varchar('size', { length: 100 }),
  description: text('description').notNull(),
  status: varchar('status', { length: 30 }).default('DRAFT').notNull(),

  // Section 3: Origin and Location Snapshot
  originLocation: jsonb('origin_location').default({}).notNull(),

  // Section 4: Minimum Order Quantity & Availability
  moq: jsonb('moq').default({}).notNull(),

  // Section 5: Processing, Manufacturing and Packaging
  processing: jsonb('processing').default({}).notNull(),

  // Section 6: Dynamic Specifications and Other Attributes
  specifications: jsonb('specifications').default([]).notNull(),
  otherAttributes: jsonb('other_attributes').default([]).notNull(),

  // Section 2: Product Images Gallery
  images: jsonb('images').default([]).notNull(),

  // Section 7: Certifications & Compliance Documents
  certifications: jsonb('certifications').default([]).notNull(),

  // Admin Review & Approval
  adminComments: text('admin_comments'),
  reviewedAt: timestamp('reviewed_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 11. Admin Users Table
 * Dedicated administrative credentials and access control (isolated from marketplace users).
 * Streamlined: omits name and title as requested.
 */
export const adminUsers = pgTable('admin_users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('Administrator').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
