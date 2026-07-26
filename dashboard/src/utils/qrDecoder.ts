/**
 * PhishShield AI — QR Decoder Utility (Feature Purged)
 */

export interface QrDecodeResult {
  success: boolean;
  data: string;
  decodeTimeMs: number;
  error?: string;
}

export function sanitizeQrPayload(rawText: string): string {
  if (!rawText) return '';
  return rawText.trim();
}

export async function decodeQrFromImage(_imageSource: File | Blob | string): Promise<QrDecodeResult> {
  return {
    success: false,
    data: '',
    decodeTimeMs: 0,
    error: 'QR Code scanner feature has been removed.',
  };
}
