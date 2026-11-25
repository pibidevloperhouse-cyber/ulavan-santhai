import { Platform } from 'react-native';
import { getBaseUrl } from '../config/api';

const landProof = [
  'Patta / Chitta Document',
  'Upload your official Patta / Chitta document for farm cultivation verification.',
  'LAND_PROOF',
];
const gst = [
  'GST Registration Certificate (Form REG-06)',
  'Upload valid GST registration certificate for your business.',
  'GST_CERTIFICATE',
];
const fssai = [
  'FSSAI Food Safety License Certificate',
  'Mandatory state or central FSSAI registration certificate for food products.',
  'FSSAI_LICENSE',
];

export const sellerForms = {
  Farmer: {
    label: 'Farm Name',
    field: 'farmerFarmName',
    heading: 'DIRECT FARMER & CULTIVATOR FORM',
    placeholder: 'e.g. Sri Murugan Thottam',
    proofs: [landProof],
  },
  'Agricultural Producer': {
    label: 'Producer Organization / FPO Name',
    field: 'fpoName',
    proofs: [
      [
        'FPO / Cooperative Registration Certificate',
        'Certificate of Incorporation or Society Registration proof.',
        'FPO_CERTIFICATE',
      ],
    ],
  },
  'Organic Producer': {
    label: 'Organic Farm / Brand Name',
    field: 'organicFarmName',
    proofs: [
      [
        'Organic Certification Document (NPOP / PGS-India)',
        'Upload valid NPOP scope certificate from accredited organic certification agency.',
        'ORGANIC_CERTIFICATE',
      ],
    ],
  },
  'Raw-Material Provider': {
    label: 'Business / Enterprise Name',
    field: 'rawProviderName',
    proofs: [gst],
  },
  'Ingredient Producer': {
    label: 'Enterprise Name',
    field: 'ingProducerName',
    proofs: [gst],
  },
  Manufacturer: {
    label: 'Company Name',
    field: 'mfgSellerName',
    proofs: [gst, fssai],
  },
  'Value-Added Manufacturer': {
    label: 'Brand / Enterprise Name',
    field: 'vaBrandName',
    proofs: [fssai],
  },
  Other: {
    label: 'Enterprise Name',
    field: 'otherSellerName',
    proofs: [
      [
        'PAN Card / Government Identity Proof',
        'Upload valid Business or Proprietor PAN Card proof.',
        'ID_PROOF',
      ],
      gst,
    ],
  },
};

export const sellerPlan = {
  name: 'Seller Platform Membership',
  badge: 'Seller Membership',
  title: 'Agricultural Producer Membership',
  description:
    'List crops, receive verified commercial buyer enquiries, and manage your agricultural sales.',
  benefits: [
    'You can select multiple classifications. A ₹365 fee applies to each selected classification.',
    '100% Verified Farmer / Producer Badge',
    'Showcase unlimited crop & harvest lots',
    'Receive direct verified commercial buyer enquiries',
    'Zero commission on all farm-gate transactions',
    'Direct farmer-to-buyer transparent communication',
  ],
};

/**
 * Upload a verification document to POST /api/v1/documents/upload
 * Uses React Native XMLHttpRequest so { uri, type, name } FormData parts stream natively
 * (Expo 58 global fetch rejects RN uri-based FormData parts) and reports upload progress.
 */
export async function uploadDocumentProof(asset, documentType, token, onProgress) {
  const extension = (asset.name || '').split('.').pop().toLowerCase();
  const rawMime =
    asset.mimeType ||
    {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    }[extension] ||
    'application/octet-stream';
  const mimeType = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;

  let uploadName = asset.name || `document_${Date.now()}`;
  if (!/\.[a-z0-9]+$/i.test(uploadName)) {
    uploadName += mimeType === 'application/pdf' ? '.pdf' : '.jpg';
  }

  const body = new FormData();
  body.append('documentType', documentType);
  if (Platform.OS === 'web' && asset.file) {
    body.append('file', asset.file, uploadName);
  } else {
    body.append('file', {
      uri: asset.uri,
      type: mimeType,
      name: uploadName,
    });
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', getBaseUrl() + '/api/v1/documents/upload');
    xhr.timeout = 30000;
    xhr.setRequestHeader('Accept', 'application/json');
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const pct = Math.min(95, Math.max(20, Math.round((event.loaded / event.total) * 90)));
          onProgress(pct);
        }
      };
    }

    xhr.onload = () => {
      let result = null;
      try {
        result = JSON.parse(xhr.responseText || 'null');
      } catch {
        result = null;
      }
      const documentId = result?.documentId || result?.data?.documentId;
      const url = result?.url || result?.data?.url || '';

      if (xhr.status >= 200 && xhr.status < 300 && result?.success !== false && documentId) {
        resolve({
          documentId,
          url,
          fileName: result?.fileName || result?.data?.fileName || uploadName,
          documentType,
        });
      } else {
        reject(
          new Error(
            result?.message ||
              result?.error ||
              `Document upload failed (${xhr.status}). Please try again.`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error('Network error while uploading document. Please check backend connection.')
      );
    };

    xhr.ontimeout = () => {
      reject(new Error('Document upload timed out. Please try again.'));
    };

    xhr.send(body);
  });
}

export async function uploadSellerProof(asset, documentType, token, onProgress) {
  const uploaded = await uploadDocumentProof(asset, documentType, token, onProgress);
  return uploaded.documentId;
}
