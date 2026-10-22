import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
  /** Accessible description of what the QR code encodes. */
  label: string;
}

/**
 * Renders a QR code for a shareable URL. The code is generated on the client
 * with the `qrcode` library — nothing is sent to a third-party service.
 */
export function QrCode({ value, size = 180, className, label }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b0d1a', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className={`animate-pulse rounded-md border border-line bg-surface ${className ?? ''}`}
        style={{ width: size, height: size }}
        aria-label={label}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt={label}
      className={`rounded-md border border-line bg-white p-1.5 ${className ?? ''}`}
    />
  );
}
