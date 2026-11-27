import { queryClient } from '../config/db.js';

export const initAllTables = async () => {
  try {
    console.log('[DATABASE] Running schema migration in Supabase...');

    await queryClient.unsafe(`
      CREATE TABLE IF NOT EXISTS public.users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        mobile VARCHAR(15) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        role VARCHAR(30) NOT NULL DEFAULT 'unassigned',
        sub_type VARCHAR(50),
        onboarded BOOLEAN NOT NULL DEFAULT FALSE,
        application_id VARCHAR(64),
        seller_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
        buyer_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
        seller_paid BOOLEAN NOT NULL DEFAULT FALSE,
        buyer_paid BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Ensure new columns are added if users table already exists
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS seller_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS buyer_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS seller_paid BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS buyer_paid BOOLEAN NOT NULL DEFAULT FALSE;

      CREATE TABLE IF NOT EXISTS public.documents (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        file_size NUMERIC NOT NULL,
        mime_type VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'UPLOADED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.payments (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        order_id VARCHAR(100) UNIQUE,
        transaction_id VARCHAR(100) UNIQUE,
        amount NUMERIC(10, 2) NOT NULL DEFAULT 365.00,
        amount_paise INTEGER,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        role VARCHAR(30) NOT NULL DEFAULT 'SELLER',
        payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
        plan VARCHAR(100) NOT NULL,
        plan_id VARCHAR(50) DEFAULT 'SELLER_ANNUAL',
        signature TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.buyer_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
        buyer_type VARCHAR(50) NOT NULL,
        business_name VARCHAR(150),
        district VARCHAR(100),
        city VARCHAR(100),
        pin_code VARCHAR(20),
        address TEXT,
        is_gst BOOLEAN NOT NULL DEFAULT FALSE,
        gstin VARCHAR(50),
        fssai_number VARCHAR(50),
        target_commodities TEXT,
        procurement_volume VARCHAR(100),
        category_details JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Ensure new clean columns are added if buyer_profiles already existed
      ALTER TABLE public.buyer_profiles
      ADD COLUMN IF NOT EXISTS business_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS target_commodities TEXT,
      ADD COLUMN IF NOT EXISTS procurement_volume VARCHAR(100),
      ADD COLUMN IF NOT EXISTS category_details JSONB NOT NULL DEFAULT '{}';

      -- Auto-backfill existing legacy buyer rows
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buyer_profiles' AND column_name = 'company_name') THEN
          UPDATE public.buyer_profiles
          SET business_name = COALESCE(business_name, company_name, shop_name, 'Buyer Enterprise')
          WHERE business_name IS NULL;

          -- Clean up obsolete columns from buyer_profiles
          ALTER TABLE public.buyer_profiles
          DROP COLUMN IF EXISTS commodities,
          DROP COLUMN IF EXISTS volume,
          DROP COLUMN IF EXISTS frequency,
          DROP COLUMN IF EXISTS payment_method,
          DROP COLUMN IF EXISTS payment_terms,
          DROP COLUMN IF EXISTS constitution,
          DROP COLUMN IF EXISTS designation,
          DROP COLUMN IF EXISTS company_name,
          DROP COLUMN IF EXISTS activity,
          DROP COLUMN IF EXISTS raw_materials,
          DROP COLUMN IF EXISTS capacity,
          DROP COLUMN IF EXISTS shop_name,
          DROP COLUMN IF EXISTS reseller_type;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS public.seller_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
        seller_type VARCHAR(50)[] NOT NULL DEFAULT '{}',
        business_name VARCHAR(150) NOT NULL,

        -- Common Location
        district VARCHAR(100),
        village VARCHAR(100),
        pin_code VARCHAR(20),
        farm_address TEXT,

        -- Compliance Flags
        is_gst BOOLEAN NOT NULL DEFAULT FALSE,
        gstin VARCHAR(50),
        fssai_number VARCHAR(50),

        -- Dynamic Full-Fidelity Category Attributes
        category_details JSONB NOT NULL DEFAULT '{}',

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Ensure clean core columns and category_details exist
      ALTER TABLE public.seller_profiles
        ADD COLUMN IF NOT EXISTS business_name VARCHAR(150),
        ADD COLUMN IF NOT EXISTS district VARCHAR(100),
        ADD COLUMN IF NOT EXISTS village VARCHAR(100),
        ADD COLUMN IF NOT EXISTS pin_code VARCHAR(20),
        ADD COLUMN IF NOT EXISTS farm_address TEXT,
        ADD COLUMN IF NOT EXISTS is_gst BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS gstin VARCHAR(50),
        ADD COLUMN IF NOT EXISTS fssai_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS category_details JSONB NOT NULL DEFAULT '{}';

      -- Auto-backfill existing sparse columns into category_details and drop unwanted columns
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_profiles' AND column_name = 'farmer_farm_name') THEN
          UPDATE public.seller_profiles
          SET category_details = jsonb_strip_nulls(
            COALESCE(category_details, '{}'::jsonb) ||
            jsonb_build_object(
              'farmerFarmName', farmer_farm_name,
              'fpoName', fpo_name,
              'fpoStructure', fpo_structure,
              'fpoIsRegistered', fpo_is_registered,
              'fpoRegNumber', fpo_reg_number,
              'organicFarmName', organic_farm_name,
              'organicCertStatus', organic_cert_status,
              'organicHasLicense', organic_has_license,
              'organicScopeNumber', organic_scope_number,
              'rawProviderName', raw_provider_name,
              'ingProducerName', ing_producer_name,
              'ingHasFssai', ing_has_fssai,
              'ingFssaiNumber', ing_fssai_number,
              'mfgSellerName', mfg_seller_name,
              'mfgHasFssai', mfg_has_fssai,
              'mfgFssaiNumber', mfg_fssai_number,
              'mfgIsGst', mfg_is_gst,
              'mfgGstin', mfg_gstin,
              'vaBrandName', va_brand_name,
              'vaHasFssai', va_has_fssai,
              'vaFssaiNumber', va_fssai_number,
              'otherSellerName', other_seller_name,
              'otherActivity', other_activity,
              'otherIsGst', other_is_gst,
              'otherGstin', other_gstin
            )
          )
          WHERE category_details = '{}'::jsonb OR category_details IS NULL;

          ALTER TABLE public.seller_profiles
            DROP COLUMN IF EXISTS farmer_farm_name,
            DROP COLUMN IF EXISTS fpo_name,
            DROP COLUMN IF EXISTS fpo_structure,
            DROP COLUMN IF EXISTS fpo_is_registered,
            DROP COLUMN IF EXISTS fpo_reg_number,
            DROP COLUMN IF EXISTS organic_farm_name,
            DROP COLUMN IF EXISTS organic_cert_status,
            DROP COLUMN IF EXISTS organic_has_license,
            DROP COLUMN IF EXISTS organic_scope_number,
            DROP COLUMN IF EXISTS raw_provider_name,
            DROP COLUMN IF EXISTS ing_producer_name,
            DROP COLUMN IF EXISTS ing_has_fssai,
            DROP COLUMN IF EXISTS ing_fssai_number,
            DROP COLUMN IF EXISTS mfg_seller_name,
            DROP COLUMN IF EXISTS mfg_has_fssai,
            DROP COLUMN IF EXISTS mfg_fssai_number,
            DROP COLUMN IF EXISTS mfg_is_gst,
            DROP COLUMN IF EXISTS mfg_gstin,
            DROP COLUMN IF EXISTS va_brand_name,
            DROP COLUMN IF EXISTS va_has_fssai,
            DROP COLUMN IF EXISTS va_fssai_number,
            DROP COLUMN IF EXISTS other_seller_name,
            DROP COLUMN IF EXISTS other_activity,
            DROP COLUMN IF EXISTS other_is_gst,
            DROP COLUMN IF EXISTS other_gstin,
            DROP COLUMN IF EXISTS primary_products,
            DROP COLUMN IF EXISTS capacity;
        END IF;
      END $$;

      -- Support multi-category array column in seller_profiles and wider payment plans
      ALTER TABLE public.seller_profiles 
        ALTER COLUMN seller_type TYPE VARCHAR(50)[] 
        USING CASE 
          WHEN seller_type IS NULL THEN '{}'::VARCHAR(50)[]
          WHEN seller_type::text LIKE '{%}' THEN seller_type::VARCHAR(50)[]
          ELSE string_to_array(seller_type::text, ', ')::VARCHAR(50)[]
        END;
      ALTER TABLE public.seller_profiles 
        ALTER COLUMN seller_type SET DEFAULT '{}'::VARCHAR(50)[];
      ALTER TABLE public.applications ALTER COLUMN sub_type TYPE VARCHAR(255);
      ALTER TABLE public.buyer_profiles ALTER COLUMN buyer_type TYPE VARCHAR(255);
      ALTER TABLE public.payments ALTER COLUMN plan TYPE VARCHAR(255);

      -- Fast Indexing for Real-Time Search & Retrieval
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON public.seller_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_district ON public.seller_profiles(district);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_seller_type ON public.seller_profiles USING gin (seller_type);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_business_name ON public.seller_profiles(business_name);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_category_details ON public.seller_profiles USING gin (category_details);

      -- Ensure profile_payload exists on applications
      ALTER TABLE public.applications
      ADD COLUMN IF NOT EXISTS profile_payload JSONB DEFAULT '{}';

      CREATE TABLE IF NOT EXISTS public.applications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        role VARCHAR(30) NOT NULL,
        sub_type VARCHAR(255) NOT NULL,
        profile_payload JSONB DEFAULT '{}',
        documents JSONB,
        overall_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
        admin_comments TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Auto-backfill existing legacy rows
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_profiles' AND column_name = 'farm_name') THEN
          UPDATE public.seller_profiles
          SET business_name = COALESCE(business_name, farm_name, 'Farm Enterprise')
          WHERE business_name IS NULL;

          UPDATE public.seller_profiles
          SET category_details = jsonb_build_object(
            'farmName', farm_name,
            'landSize', land_size,
            'crops', crops,
            'farmingMethod', farming_method
          )
          WHERE (category_details IS NULL OR category_details = '{}'::jsonb) AND farm_name IS NOT NULL;

          -- Clean up legacy clutter columns
          ALTER TABLE public.seller_profiles
          DROP COLUMN IF EXISTS farm_name,
          DROP COLUMN IF EXISTS land_size,
          DROP COLUMN IF EXISTS category,
          DROP COLUMN IF EXISTS crops,
          DROP COLUMN IF EXISTS available_qty,
          DROP COLUMN IF EXISTS harvest_months,
          DROP COLUMN IF EXISTS price_expectation,
          DROP COLUMN IF EXISTS farming_method,
          DROP COLUMN IF EXISTS fpo_name,
          DROP COLUMN IF EXISTS fpo_structure,
          DROP COLUMN IF EXISTS reg_number,
          DROP COLUMN IF EXISTS member_count,
          DROP COLUMN IF EXISTS combined_acreage,
          DROP COLUMN IF EXISTS cert_status,
          DROP COLUMN IF EXISTS cert_agency,
          DROP COLUMN IF EXISTS scope_number,
          DROP COLUMN IF EXISTS brand_name,
          DROP COLUMN IF EXISTS monthly_capacity;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS public.product_categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS public.products (
        id VARCHAR(64) PRIMARY KEY,
        seller_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        product_type VARCHAR(100),
        variety VARCHAR(100),
        quality_grade VARCHAR(50),
        size VARCHAR(100),
        description TEXT NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
        origin_location JSONB NOT NULL DEFAULT '{}',
        moq JSONB NOT NULL DEFAULT '{}',
        processing JSONB NOT NULL DEFAULT '{}',
        specifications JSONB NOT NULL DEFAULT '[]',
        other_attributes JSONB NOT NULL DEFAULT '[]',
        images JSONB NOT NULL DEFAULT '[]',
        certifications JSONB NOT NULL DEFAULT '[]',
        admin_comments TEXT,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      ALTER TABLE public.products
      ADD COLUMN IF NOT EXISTS admin_comments TEXT,
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

      -- Seed default categories if none exist
      INSERT INTO public.product_categories (id, name, description)
      VALUES 
        ('cat_grains', 'Grains & Cereals', 'Paddy, rice, wheat, corn, millets and other whole grain staples.'),
        ('cat_millets', 'Millets & Superfoods', 'Ragi, thinai, kuthiraivali, samai, varagu and pearl millet.'),
        ('cat_pulses', 'Pulses & Legumes', 'Toor dal, urad dal, moong dal, chana, green gram, cowpea.'),
        ('cat_flours', 'Flours & Mixes', 'Millet flour, rice flour, atta, maida, custom health mixes.'),
        ('cat_spices', 'Spices & Condiments', 'Turmeric, black pepper, cardamom, cloves, red chilli, coriander seeds.'),
        ('cat_vegetables', 'Fresh Vegetables', 'Daily farm fresh country vegetables, greens, roots and tubers.'),
        ('cat_fruits', 'Fresh Fruits', 'Bananas, mangoes, papayas, guavas, pomegranates, citrus fruits.'),
        ('cat_oils', 'Cold-Pressed Oils', 'Traditional wood-pressed gingelly, coconut, groundnut and mustard oils.'),
        ('cat_dairy', 'Dairy & Livestock Produce', 'Country cow milk, pure ghee, paneer, butter, organic honey.'),
        ('cat_organic', 'Certified Organic Produce', 'NPOP/PGS-India certified organic grains, fruits and processed goods.')
      ON CONFLICT (name) DO NOTHING;

      -- Membership Plans Table & Seeding
      CREATE TABLE IF NOT EXISTS public.membership_plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'SELLER',
        price_in_paise INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        duration_days INTEGER NOT NULL DEFAULT 365,
        description TEXT,
        features JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      INSERT INTO public.membership_plans (
        id, name, role, price_in_paise, currency, duration_days, description, features, is_active
      ) VALUES 
        (
          'SELLER_ANNUAL',
          'Verified Seller Annual Membership',
          'SELLER',
          36500,
          'INR',
          365,
          'Full 1-year verified access to list agricultural produce on Ulavan Santhai.',
          '["Verified Farmer / Merchant badge", "Unlimited produce listings", "Direct buyer inquiries access", "Priority market visibility"]'::jsonb,
          TRUE
        ),
        (
          'BUYER_ANNUAL',
          'Buyer Verified Access Plan',
          'BUYER',
          36500,
          'INR',
          365,
          'Annual verified access for agricultural produce buyers, wholesalers, and procurement enterprises.',
          '["Verified Buyer / Procurement Badge", "Direct access to farmer produce listings", "Direct contact with verified farmers", "Create procurement requests and RFQs", "Priority seller response support"]'::jsonb,
          TRUE
        )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        price_in_paise = EXCLUDED.price_in_paise,
        currency = EXCLUDED.currency,
        duration_days = EXCLUDED.duration_days,
        description = EXCLUDED.description,
        features = EXCLUDED.features,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

      -- Seller Categories Table linked to membership_plans via Foreign Key
      CREATE TABLE IF NOT EXISTS public.seller_categories (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        required_documents JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        CONSTRAINT fk_seller_categories_plan FOREIGN KEY (plan_id)
          REFERENCES public.membership_plans(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      );

      -- Ensure metadata column exists on payments for category breakdown snapshots
      ALTER TABLE public.payments
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

      -- Seed 8 Default Seller Classifications Linked to SELLER_ANNUAL
      INSERT INTO public.seller_categories (
        id, code, name, plan_id, required_documents, is_active
      ) VALUES
        ('CAT-SEL-01', 'Farmer', 'Farmer & Agricultural Cultivators', 'SELLER_ANNUAL', '["LAND_PROOF"]'::jsonb, TRUE),
        ('CAT-SEL-02', 'Agricultural Producer', 'Agricultural Producer (FPO / Society)', 'SELLER_ANNUAL', '["FPO_CERTIFICATE"]'::jsonb, TRUE),
        ('CAT-SEL-03', 'Organic Producer', 'Organic Producer', 'SELLER_ANNUAL', '["ORGANIC_CERTIFICATE"]'::jsonb, TRUE),
        ('CAT-SEL-04', 'Raw-Material Provider', 'Raw-Material Provider', 'SELLER_ANNUAL', '["GST_CERTIFICATE"]'::jsonb, TRUE),
        ('CAT-SEL-05', 'Ingredient Producer', 'Ingredient Producer', 'SELLER_ANNUAL', '["FSSAI_LICENSE"]'::jsonb, TRUE),
        ('CAT-SEL-06', 'Manufacturer', 'Manufacturer', 'SELLER_ANNUAL', '["FSSAI_LICENSE", "GST_CERTIFICATE"]'::jsonb, TRUE),
        ('CAT-SEL-07', 'Value-Added Manufacturer', 'Value-Added Manufacturer', 'SELLER_ANNUAL', '["FSSAI_LICENSE"]'::jsonb, TRUE),
        ('CAT-SEL-08', 'Other', 'Other Agri Enterprises', 'SELLER_ANNUAL', '["ID_PROOF", "GST_CERTIFICATE"]'::jsonb, TRUE)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        plan_id = EXCLUDED.plan_id,
        required_documents = EXCLUDED.required_documents,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

      CREATE INDEX IF NOT EXISTS idx_seller_categories_code ON public.seller_categories(code);
      CREATE INDEX IF NOT EXISTS idx_seller_categories_plan_id ON public.seller_categories(plan_id);
      CREATE INDEX IF NOT EXISTS idx_seller_categories_active ON public.seller_categories(is_active);

      -- Admin Users Table (Isolated from marketplace users; no name/title columns)
      CREATE TABLE IF NOT EXISTS public.admin_users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'Administrator',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

      CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
      CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile);
      CREATE INDEX IF NOT EXISTS idx_buyer_profiles_district ON public.buyer_profiles(district);
      CREATE INDEX IF NOT EXISTS idx_buyer_profiles_type ON public.buyer_profiles(buyer_type);
      CREATE INDEX IF NOT EXISTS idx_buyer_profiles_bname ON public.buyer_profiles(business_name);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_district ON public.seller_profiles(district);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_seller_type ON public.seller_profiles USING gin (seller_type);
      CREATE INDEX IF NOT EXISTS idx_seller_profiles_bname ON public.seller_profiles(business_name);
      CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
      CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
      CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

      -- Foreign Key Trigger on seller_profiles.seller_type
      CREATE OR REPLACE FUNCTION check_seller_type_category_fk()
      RETURNS TRIGGER AS $$
      DECLARE
        invalid_category text;
      BEGIN
        IF NEW.seller_type IS NOT NULL AND array_length(NEW.seller_type, 1) > 0 THEN
          SELECT item INTO invalid_category
          FROM unnest(NEW.seller_type) AS item
          WHERE item NOT IN (
            SELECT id FROM public.seller_categories
            UNION
            SELECT code FROM public.seller_categories
          )
          LIMIT 1;

          IF invalid_category IS NOT NULL THEN
            RAISE EXCEPTION 'Foreign Key Violation: Category "%" does not exist in seller_categories table.', invalid_category
              USING ERRCODE = 'foreign_key_violation';
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_seller_profiles_check_categories ON public.seller_profiles;

      CREATE TRIGGER trg_seller_profiles_check_categories
      BEFORE INSERT OR UPDATE OF seller_type ON public.seller_profiles
      FOR EACH ROW EXECUTE FUNCTION check_seller_type_category_fk();

      -- Prevent deleting referenced categories in seller_categories
      CREATE OR REPLACE FUNCTION prevent_seller_category_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM public.seller_profiles 
          WHERE OLD.id = ANY(seller_type) OR OLD.code = ANY(seller_type)
        ) THEN
          RAISE EXCEPTION 'Foreign Key Violation: Cannot delete category "%" because it is referenced in seller_profiles.', OLD.id
            USING ERRCODE = 'foreign_key_violation';
        END IF;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_prevent_seller_category_delete ON public.seller_categories;

      CREATE TRIGGER trg_prevent_seller_category_delete
      BEFORE DELETE ON public.seller_categories
      FOR EACH ROW EXECUTE FUNCTION prevent_seller_category_delete();
    `);

    console.log('[DATABASE] Migration completed successfully in Supabase.');
    return { ok: true, message: 'All tables initialized and updated' };
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to initialize tables:', error.message);
    throw error;
  }
};

if (process.argv[1]?.endsWith('initDb.js')) {
  initAllTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
