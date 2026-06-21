import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RATA — Regenerative Art Tourism Association',
  description:
    '徳之島Ocean Gaia。日本初の環境再生型水中彫刻を訪れ、海の再生を見守るデジタルパス「RATA PASS」。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
