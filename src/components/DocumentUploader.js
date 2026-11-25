import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { uploadDocumentProof } from '../services/sellerOnboarding';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return '0 KB';
  const size = Number(bytes);
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function UploadCloudIcon() {
  return (
    <View style={ic.uploadWrap}>
      <View style={ic.arrowHead} />
      <View style={ic.arrowStem} />
      <View style={ic.tray} />
    </View>
  );
}

function EyeIcon() {
  return (
    <View style={ic.eyeOuter}>
      <View style={ic.eyePupil} />
    </View>
  );
}

function TrashIcon() {
  return (
    <View style={ic.trashWrap}>
      <View style={ic.trashHandle} />
      <View style={ic.trashLid} />
      <View style={ic.trashBody}>
        <View style={ic.trashBar} />
        <View style={ic.trashBar} />
      </View>
    </View>
  );
}

/**
 * Reusable 3-state Document Uploader for both Buyer & Seller onboarding:
 * 1. Empty dashed dropzone
 * 2. Animated percentage & green progress bar while uploading
 * 3. Uploaded summary card (IMG/PDF badge, file size, DOC ID, View/Replace/Delete actions)
 */
export default function DocumentUploader({
  documentType,
  title,
  description,
  required = false,
  uploadedDoc = null,
  token = null,
  disabled = false,
  onUploadStart,
  onUploadEnd,
  onUploadSuccess,
  onRemove,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const animateProgressTo = (targetPercent) => {
    Animated.timing(progressAnim, {
      toValue: targetPercent,
      duration: 160,
      useNativeDriver: false,
    }).start();
  };

  const handlePickAndUpload = async () => {
    if (isUploading || disabled) return;
    setError('');

    try {
      const { getDocumentAsync } = require('expo-document-picker');
      const choice = await getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: false,
        copyToCacheDirectory: true,
        base64: false,
      });

      if (choice.canceled || !choice.assets || choice.assets.length === 0) {
        return;
      }

      const file = choice.assets[0];
      const fileName = file.name || `document_${Date.now()}.jpg`;
      const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
      const fileMime = (file.mimeType || '').toLowerCase();
      const isAllowedByExt = ALLOWED_EXTENSIONS.includes(ext);
      const isAllowedByMime = ALLOWED_MIME_TYPES.has(fileMime);

      if (!isAllowedByExt && !isAllowedByMime) {
        setError(`Invalid format (.${ext || fileMime || 'unknown'}). Only PDF, JPG, JPEG, PNG, and WEBP are allowed.`);
        return;
      }

      if (file.size != null && file.size > MAX_SIZE_BYTES) {
        setError(`File size (${formatFileSize(file.size)}) exceeds 5 MB limit.`);
        return;
      }

      setIsUploading(true);
      onUploadStart?.(documentType);
      progressAnim.setValue(10);
      setUploadProgress(20);
      animateProgressTo(20);

      timerRef.current = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 90;
          }
          const next = Math.min(90, prev + 25);
          animateProgressTo(next);
          return next;
        });
      }, 150);

      const minAnimationDelay = new Promise((resolve) => setTimeout(resolve, 650));

      let uploadResult;
      if (token) {
        const [apiRes] = await Promise.all([
          uploadDocumentProof(file, documentType, token, (realPct) => {
            if (!mountedRef.current) return;
            setUploadProgress((prev) => {
              const next = Math.max(prev, realPct);
              animateProgressTo(next);
              return next;
            });
          }),
          minAnimationDelay,
        ]);
        uploadResult = apiRes;
      } else {
        await minAnimationDelay;
        const generatedId = `DOC_${Math.floor(100000 + Math.random() * 900000)}`;
        uploadResult = {
          documentId: generatedId,
          url: file.uri || '',
          fileName,
          documentType,
        };
      }

      if (timerRef.current) clearInterval(timerRef.current);
      if (!mountedRef.current) return;

      setUploadProgress(100);
      animateProgressTo(100);

      setTimeout(() => {
        if (!mountedRef.current) return;
        setIsUploading(false);
        setUploadProgress(0);
        progressAnim.setValue(0);
        onUploadEnd?.(documentType);
        onUploadSuccess({
          documentId: uploadResult.documentId,
          documentType,
          fileName: uploadResult.fileName || fileName,
          fileSize: file.size || 0,
          uri: file.uri || '',
          url: uploadResult.url || file.uri || '',
          mimeType: file.mimeType || (ext === 'pdf' ? 'application/pdf' : 'image/jpeg'),
        });
      }, 280);
    } catch (err) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!mountedRef.current) return;
      setIsUploading(false);
      setUploadProgress(0);
      progressAnim.setValue(0);
      onUploadEnd?.(documentType);
      setError(err?.message || 'Failed to upload document. Please try again.');
    }
  };

  const isPdf =
    (uploadedDoc?.fileName || '').toLowerCase().endsWith('.pdf') ||
    (uploadedDoc?.mimeType || '').toLowerCase() === 'application/pdf';
  const previewSourceUri = uploadedDoc?.uri || uploadedDoc?.url || '';
  const animatedBarWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const handleOpenExternal = async () => {
    if (!previewSourceUri) return;
    try {
      await Linking.openURL(previewSourceUri);
    } catch {
      // Ignore if device cannot open local file URI directly
    }
  };

  return (
    <View style={s.card}>
      {/* Card Header */}
      <View style={s.headerRow}>
        <Text style={s.title}>
          {title}
          {required ? <Text style={s.requiredStar}> *</Text> : null}
        </Text>
        {!required && (
          <View style={s.optionalBadge}>
            <Text style={s.optionalText}>Optional</Text>
          </View>
        )}
      </View>
      <Text style={s.description}>{description}</Text>

      {/* State 1: Uploaded Document Card */}
      {uploadedDoc ? (
        <View style={s.uploadedBox}>
          <View style={s.uploadedTopRow}>
            <View style={s.fileTypeBadge}>
              <Text style={s.fileTypeText}>{isPdf ? 'PDF' : 'IMG'}</Text>
            </View>
            <View style={s.fileMetaCol}>
              <Text style={s.fileName} numberOfLines={1} ellipsizeMode="tail">
                {uploadedDoc.fileName}
              </Text>
              <View style={s.metaSubRow}>
                <Text style={s.fileSize}>{formatFileSize(uploadedDoc.fileSize)}</Text>
                <Text style={s.metaDot}>•</Text>
                <Text style={s.uploadedStatus}>
                  Uploaded (ID: {uploadedDoc.documentId})
                </Text>
              </View>
            </View>
          </View>

          <View style={s.actionBtnRow}>
            {Boolean(previewSourceUri) && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View document"
                onPress={() => setPreviewVisible(true)}
                style={s.viewBtn}
              >
                <EyeIcon />
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Replace document"
              disabled={disabled}
              onPress={handlePickAndUpload}
              style={s.replaceBtn}
            >
              <Text style={s.replaceIcon}>↻</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove document"
              disabled={disabled}
              onPress={() => {
                setError('');
                onRemove?.(documentType);
              }}
              style={s.deleteBtn}
            >
              <TrashIcon />
            </Pressable>
          </View>
        </View>
      ) : isUploading ? (
        /* State 2: Animated Uploading Progress Bar */
        <View style={s.uploadingBox}>
          <View style={s.uploadingHeader}>
            <Text style={s.uploadingLabel}>Uploading document...</Text>
            <Text style={s.uploadingPercent}>{uploadProgress}%</Text>
          </View>
          <View style={s.progressTrack}>
            <Animated.View style={[s.progressFill, { width: animatedBarWidth }]} />
          </View>
        </View>
      ) : (
        /* State 3: Empty Dropzone */
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Upload ${title}`}
          disabled={disabled}
          onPress={handlePickAndUpload}
          style={({ pressed }) => [
            s.dropzone,
            pressed && s.dropzonePressed,
          ]}
        >
          <View style={s.uploadCircle}>
            <UploadCloudIcon />
          </View>
          <Text style={s.dropTitle}>Click to upload document</Text>
          <Text style={s.dropSub}>Allowed: PDF, JPG, JPEG, PNG (Max 5 MB)</Text>
        </Pressable>
      )}

      {Boolean(error) && (
        <Text accessibilityRole="alert" style={s.errorText}>
          {error}
        </Text>
      )}

      {/* Document Preview Modal */}
      <Modal
        transparent
        visible={previewVisible}
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle} numberOfLines={1}>
                {uploadedDoc?.fileName || title}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPreviewVisible(false)}
                style={s.modalCloseBtn}
              >
                <Text style={s.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            {isPdf ? (
              <View style={s.pdfPreviewBox}>
                <View style={[s.fileTypeBadge, { width: 56, height: 56, borderRadius: 16 }]}>
                  <Text style={[s.fileTypeText, { fontSize: 16 }]}>PDF</Text>
                </View>
                <Text style={s.pdfName}>{uploadedDoc?.fileName}</Text>
                <Text style={s.pdfMeta}>
                  {formatFileSize(uploadedDoc?.fileSize)} • ID: {uploadedDoc?.documentId}
                </Text>
                {previewSourceUri.startsWith('http') && (
                  <Pressable onPress={handleOpenExternal} style={s.openExternalBtn}>
                    <Text style={s.openExternalText}>Open PDF Document</Text>
                  </Pressable>
                )}
              </View>
            ) : previewSourceUri ? (
              <Image
                source={{ uri: previewSourceUri }}
                style={s.previewImage}
                resizeMode="contain"
              />
            ) : null}

            <Pressable
              onPress={() => setPreviewVisible(false)}
              style={s.modalDoneBtn}
            >
              <Text style={s.modalDoneText}>Close Preview</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: '800',
  },
  optionalBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  description: {
    fontSize: 13.5,
    color: '#6B7280',
    lineHeight: 19,
    marginTop: 5,
  },

  /* Empty Dropzone (Image 3) */
  dropzone: {
    marginTop: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzonePressed: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  uploadCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dropTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  dropSub: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },

  /* Uploading Progress State (Image 1) */
  uploadingBox: {
    marginTop: 16,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#6EE7B7',
    backgroundColor: '#F0FDF7',
  },
  uploadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  uploadingLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#374151',
  },
  uploadingPercent: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#047857',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#059669',
  },

  /* Uploaded State (Image 2) */
  uploadedBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#EFFBF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  uploadedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileTypeBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileTypeText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  fileMetaCol: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  metaSubRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  fileSize: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 13,
    color: '#6B7280',
  },
  uploadedStatus: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  viewBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceIcon: {
    fontSize: 19,
    fontWeight: '700',
    color: '#047857',
    lineHeight: 22,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12.5,
    color: '#DC2626',
    marginTop: 8,
    fontWeight: '600',
  },

  /* Preview Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  previewImage: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  pdfPreviewBox: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    gap: 10,
  },
  pdfName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  pdfMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  openExternalBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  openExternalText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  modalDoneBtn: {
    backgroundColor: '#174B35',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});

const ic = StyleSheet.create({
  /* Geometric Upload Arrow */
  uploadWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHead: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#6B7280',
    transform: [{ rotate: '45deg' }],
    marginBottom: -4,
  },
  arrowStem: {
    width: 2,
    height: 10,
    backgroundColor: '#6B7280',
  },
  tray: {
    width: 16,
    height: 5,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#6B7280',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginTop: 2,
  },

  /* Geometric Eye */
  eyeOuter: {
    width: 18,
    height: 11,
    borderRadius: 9,
    borderWidth: 1.8,
    borderColor: '#174B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1.6,
    borderColor: '#174B35',
  },

  /* Geometric Trash Bin */
  trashWrap: {
    width: 16,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashHandle: {
    width: 6,
    height: 2.5,
    borderTopWidth: 1.6,
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderColor: '#DC2626',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  trashLid: {
    width: 15,
    height: 1.8,
    backgroundColor: '#DC2626',
    borderRadius: 1,
    marginBottom: 1.5,
  },
  trashBody: {
    width: 11.5,
    height: 11,
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderBottomWidth: 1.6,
    borderColor: '#DC2626',
    borderBottomLeftRadius: 2.5,
    borderBottomRightRadius: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  trashBar: {
    width: 1.4,
    height: 6,
    backgroundColor: '#DC2626',
    borderRadius: 1,
  },
});
