process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
dotenv.config();
process.env.NODE_ENV = 'test';

import { app } from '../src/server.js';
import * as userRepository from '../src/repositories/user.repository.js';
import { generateAuthToken } from '../src/services/auth.service.js';

const TEST_PORT = 5065;
let serverInstance = null;

async function runProductTests() {
  console.log('[TEST] Starting End-to-End Product Management Test Suite...');

  // 1. Start test server
  await new Promise((resolve) => {
    serverInstance = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`[TEST] Test server listening on http://127.0.0.1:${TEST_PORT}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 2. Fetch test seller user
    const testUser = await userRepository.findByEmail('nithishtestcase@gmail.com');
    if (!testUser) {
      throw new Error('Test seller user not found.');
    }
    const token = generateAuthToken(testUser);
    console.log(`[TEST] Authenticated Seller: ${testUser.id} (${testUser.email})`);

    // =========================================================================
    // TEST 1: Fetch Categories (Loaded from DB)
    // =========================================================================
    console.log('\n--- TEST 1: Fetch Product Categories ---');
    const catRes = await fetch(`${baseUrl}/api/v1/seller/products/categories`);
    const catJson = await catRes.json();
    console.log(`[TEST 1] Status: ${catRes.status}, Categories found: ${catJson.count}`);
    if (catRes.status !== 200 || !catJson.categories || catJson.categories.length === 0) {
      throw new Error('TEST 1 FAILED: Could not retrieve categories.');
    }
    console.log('  Sample Categories:', catJson.categories.slice(0, 3).map(c => c.name));

    // =========================================================================
    // TEST 2: Upload Product Image to 'product_images' bucket
    // =========================================================================
    console.log('\n--- TEST 2: Upload Product Image ---');
    const imgForm = new FormData();
    const dummyImageBlob = new Blob([Buffer.from('fake-jpeg-image-data-test-ulavan-santhai')], {
      type: 'image/jpeg',
    });
    imgForm.append('file', dummyImageBlob, 'sample_millet.jpg');

    const imgRes = await fetch(`${baseUrl}/api/v1/seller/products/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: imgForm,
    });

    const imgJson = await imgRes.json();
    console.log(`[TEST 2] Status: ${imgRes.status}, Success: ${imgJson.success}`);
    console.log('  Image URL:', imgJson.data?.url);
    if (imgRes.status !== 200 || !imgJson.data?.url) {
      throw new Error(`TEST 2 FAILED: ${imgJson.message}`);
    }

    const uploadedImageUrl = imgJson.data.url;

    // =========================================================================
    // TEST 3: Upload Certificate Document to 'product_certificates' bucket
    // =========================================================================
    console.log('\n--- TEST 3: Upload Certificate Document ---');
    const certForm = new FormData();
    const dummyCertBlob = new Blob([Buffer.from('fake-pdf-certificate-content-ulavan-santhai')], {
      type: 'application/pdf',
    });
    certForm.append('file', dummyCertBlob, 'organic_npop_cert.pdf');

    const certRes = await fetch(`${baseUrl}/api/v1/seller/products/upload-certificate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: certForm,
    });

    const certJson = await certRes.json();
    console.log(`[TEST 3] Status: ${certRes.status}, Success: ${certJson.success}`);
    console.log('  Cert Document URL:', certJson.data?.url);
    if (certRes.status !== 200 || !certJson.data?.url) {
      throw new Error(`TEST 3 FAILED: ${certJson.message}`);
    }

    const uploadedCertUrl = certJson.data.url;

    // =========================================================================
    // TEST 4: Create Product Listing - Save as Draft (Option A Payload)
    // =========================================================================
    console.log('\n--- TEST 4: Create Product Listing (Save as Draft) ---');
    const draftPayload = {
      status: 'DRAFT',
      name: 'Organic Finger Millet (Ragi) Flour',
      category: 'Flours & Mixes',
      productType: 'Flour',
      variety: 'Paiyur 2 Native Cultivar',
      qualityGrade: 'Grade A Export Quality',
      size: '1kg & 5kg Bulk Bags',
      description: '100% natural, farm-milled organic ragi flour rich in calcium and dietary fiber.',
      images: [
        {
          id: imgJson.data.id,
          url: uploadedImageUrl,
          fileName: 'sample_millet.jpg',
          isPrimary: true,
        },
      ],
      originLocation: {
        placeOfOrigin: 'Dharmapuri, Tamil Nadu',
        productionLocation: 'Harur Organic Cluster',
        processingLocation: 'Dharmapuri Traditional Stone Mill',
        manufacturingLocation: 'Dharmapuri',
        sellerLocation: 'Dharmapuri, Tamil Nadu',
      },
      moq: {
        quantity: 50,
        unit: 'kg',
        variesBy: 'Bulk pack sizes',
        availability: 'Available',
      },
      processing: {
        processingDetails: 'Sun-dried and traditional water-cooled stone milled.',
        manufacturingDetails: 'Sieved and packed in clean hygienic facility.',
        packagingDetails: 'Food grade hermetic packaging with nitrogen flush.',
      },
      specifications: [
        { name: 'Moisture Content', value: '11.5%' },
        { name: 'Total Dietary Fiber', value: '18g / 100g' },
      ],
      otherAttributes: [
        { name: 'Shelf Life', value: '6 Months' },
        { name: 'Farming Technique', value: 'Zero Budget Natural Farming (ZBNF)' },
      ],
      certifications: [
        {
          certificationName: 'NPOP Organic Certificate',
          certificationNumber: 'NPOP/NAB/0014/2024',
          issuingAuthority: 'Aditi Organic Certifications Pvt Ltd',
          validFrom: '2024-01-01',
          validUntil: '2027-12-31',
          documentUrl: uploadedCertUrl,
        },
      ],
    };

    const draftRes = await fetch(`${baseUrl}/api/v1/seller/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(draftPayload),
    });

    const draftProductJson = await draftRes.json();
    console.log(`[TEST 4] Status: ${draftRes.status}, ProductId: ${draftProductJson.product?.id}`);
    console.log('  Saved Status:', draftProductJson.product?.status);
    if (draftRes.status !== 201 || draftProductJson.product?.status !== 'DRAFT') {
      throw new Error(`TEST 4 FAILED: ${draftProductJson.message}`);
    }

    const createdProductId = draftProductJson.product.id;

    // =========================================================================
    // TEST 5: Create Product Listing - Submit for Review
    // =========================================================================
    console.log('\n--- TEST 5: Create Product Listing (Submit for Review) ---');
    const submitPayload = {
      ...draftPayload,
      name: 'Cold-Pressed Country Sesame Oil',
      category: 'Cold-Pressed Oils',
      productType: 'Edible Oil',
      status: 'SUBMITTED',
    };

    const submitRes = await fetch(`${baseUrl}/api/v1/seller/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(submitPayload),
    });

    const submitProductJson = await submitRes.json();
    console.log(`[TEST 5] Status: ${submitRes.status}, ProductId: ${submitProductJson.product?.id}`);
    console.log('  Saved Status:', submitProductJson.product?.status);
    if (submitRes.status !== 201 || submitProductJson.product?.status !== 'SUBMITTED') {
      throw new Error(`TEST 5 FAILED: ${submitProductJson.message}`);
    }

    // =========================================================================
    // TEST 6: List Seller Products with Search & Filter
    // =========================================================================
    console.log('\n--- TEST 6: List Products (My products table) ---');
    const listRes = await fetch(`${baseUrl}/api/v1/seller/products?search=Millet`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const listJson = await listRes.json();
    console.log(`[TEST 6] Filtered Search Count: ${listJson.count}`);
    if (listRes.status !== 200 || listJson.count < 1) {
      throw new Error('TEST 6 FAILED: Could not find created product via search.');
    }
    console.log('  First Product Name:', listJson.products[0].name);

    // =========================================================================
    // TEST 7: Get Single Product by ID (Full verification of 7 sections)
    // =========================================================================
    console.log('\n--- TEST 7: Get Product by ID ---');
    const getRes = await fetch(`${baseUrl}/api/v1/seller/products/${createdProductId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const getJson = await getRes.json();
    console.log(`[TEST 7] Status: ${getRes.status}`);
    console.log('  Origin Place:', getJson.product?.originLocation?.placeOfOrigin);
    console.log('  MOQ Quantity:', getJson.product?.moq?.quantity, getJson.product?.moq?.unit);
    console.log('  Specs count:', getJson.product?.specifications?.length);
    console.log('  Certifications count:', getJson.product?.certifications?.length);
    console.log('  Primary Image:', getJson.product?.images?.[0]?.url);

    if (getJson.product?.originLocation?.placeOfOrigin !== 'Dharmapuri, Tamil Nadu') {
      throw new Error('TEST 7 FAILED: originLocation not preserved.');
    }

    // =========================================================================
    // TEST 8: Update Product (Change status or fields)
    // =========================================================================
    console.log('\n--- TEST 8: Update Product Listing ---');
    const updateRes = await fetch(`${baseUrl}/api/v1/seller/products/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'SUBMITTED',
        variety: 'Paiyur 2 (Certified Seedline)',
      }),
    });

    const updateJson = await updateRes.json();
    console.log(`[TEST 8] Status: ${updateRes.status}, New Status: ${updateJson.product?.status}`);
    if (updateJson.product?.status !== 'SUBMITTED' || updateJson.product?.variety !== 'Paiyur 2 (Certified Seedline)') {
      throw new Error('TEST 8 FAILED: Product update did not reflect.');
    }

    console.log('\n=============================================================');
    console.log('[SUCCESS] All Seller Product Tests Passed Flawlessly!');
    console.log('=============================================================\n');
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
      console.log('[TEST] Test server stopped.');
    }
  }
}

runProductTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[TEST SUITE ERROR]', err);
    process.exit(1);
  });
