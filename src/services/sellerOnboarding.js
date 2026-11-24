import { Platform } from 'react-native';
import { getBaseUrl } from '../config/api';

const landProof = ['Patta / Chitta Document', 'Upload your official Patta / Chitta document for farm cultivation verification.', 'LAND_PROOF'];
const gst = ['GST Registration Certificate', 'Upload your GST registration certificate.', 'GST_CERTIFICATE'];
const fssai = ['FSSAI License', 'Upload your food safety license certificate.', 'FSSAI_LICENSE'];

export const sellerForms = {
  Farmer: {
    label: 'Farm Name', field: 'farmerFarmName', heading: 'DIRECT FARMER & CULTIVATOR FORM',
    placeholder: 'e.g. Sri Murugan Thottam', proofs: [landProof],
  },
  'Agricultural Producer': {
    label: 'Producer Organization / FPO Name', field: 'fpoName',
    proofs: [['FPO / Cooperative Registration Certificate', 'Upload your producer organization registration certificate.', 'FPO_CERTIFICATE']],
  },
  'Organic Producer': {
    label: 'Organic Farm / Brand Name', field: 'organicFarmName',
    proofs: [['Organic Certificate', 'Upload your NPOP organic certificate.', 'ORGANIC_CERTIFICATE']],
  },
  'Raw-Material Provider': { label: 'Business / Enterprise Name', field: 'rawProviderName', proofs: [gst] },
  'Ingredient Producer': { label: 'Enterprise Name', field: 'ingProducerName', proofs: [gst] },
  Manufacturer: { label: 'Company Name', field: 'mfgSellerName', proofs: [gst, fssai] },
  'Value-Added Manufacturer': { label: 'Brand / Enterprise Name', field: 'vaBrandName', proofs: [fssai] },
  Other: { label: 'Enterprise Name', field: 'otherSellerName', proofs: [['PAN Card / Government Identity Proof', 'Upload valid business or proprietor identity proof.', 'ID_PROOF'], gst] },
};

export const sellerPlan = {
  name: 'Seller Platform Membership',
  badge: 'Seller Membership',
  title: 'Agricultural Producer Membership',
  description: 'List crops, receive verified commercial buyer enquiries, and manage your agricultural sales.',
  benefits: ['100% Verified Farmer / Producer Badge', 'Showcase unlimited crop & harvest lots',
    'Receive direct verified commercial buyer enquiries', 'Zero commission on all farm-gate transactions',
    'Direct farmer-to-buyer transparent communication'],
};

export async function uploadSellerProof(asset, documentType, token) {
  const body = new FormData();
  const extension = asset.name.split('.').pop().toLowerCase();
  const mimeType = {pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg'}[extension];
  body.append('documentType', documentType);
  body.append('file', Platform.OS === 'web' ? asset.file : { uri: asset.uri, type: mimeType, name: asset.name });
  const response = await fetch(getBaseUrl() + '/api/v1/documents/upload', {
    method: 'POST', headers: { Authorization: 'Bearer ' + token }, body,
  });
  const result = await response.json().catch(() => null);
  const id = result?.documentId || result?.data?.documentId;
  if (!response.ok || !result?.success || !id) throw new Error(result?.message || 'Document upload failed. Please try again.');
  return id;
}
