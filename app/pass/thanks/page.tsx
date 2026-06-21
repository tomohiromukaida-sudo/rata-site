import { Suspense } from 'react';
import type { Metadata } from 'next';
import ThanksContent from './ThanksContent';

export const metadata: Metadata = {
  title: 'ご登録ありがとうございます — RATA PASS',
};

export default function PassThanksPage() {
  return (
    <div className="page">
      <Suspense fallback={null}>
        <ThanksContent />
      </Suspense>
    </div>
  );
}
