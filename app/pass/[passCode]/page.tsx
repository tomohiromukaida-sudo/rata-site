import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTursoClient } from '@/lib/turso';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

type PassRow = {
  pass_code: string;
  name: string | null;
  pass_type: string;
  status: string;
  issued_at: string;
};

async function getPass(passCode: string): Promise<PassRow | null> {
  try {
    const db = getTursoClient();
    const result = await db.execute({
      sql: 'SELECT pass_code, name, pass_type, status, issued_at FROM passes WHERE pass_code = ?',
      args: [passCode],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as PassRow;
  } catch (e) {
    console.error('Turso query error:', e);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ passCode: string }>;
}): Promise<Metadata> {
  const { passCode } = await params;
  return { title: `${passCode} — RATA PASS` };
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Founding Supporter (Pending)',
  active: 'Founding Supporter',
};

export default async function PassCodePage({
  params,
}: {
  params: Promise<{ passCode: string }>;
}) {
  const { passCode } = await params;
  const pass = await getPass(passCode);

  if (!pass) {
    notFound();
  }

  return (
    <div className="page">
      <SiteNav current="/pass" />

      <main className={styles.main}>
        <p className={styles.eyebrow}>RATA PASS</p>

        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.logo}>RATA PASS</span>
            <span className={styles.statusTag}>{STATUS_LABEL[pass.status] || pass.status}</span>
          </div>
          <p className={styles.code}>{pass.pass_code}</p>
          <dl className={styles.fields}>
            <div className={styles.field}>
              <dt>Area</dt>
              <dd>Tokunoshima Ocean Gaia</dd>
            </div>
            <div className={styles.field}>
              <dt>Issued by</dt>
              <dd>Regenerative Art Tourism Association</dd>
            </div>
            <div className={styles.field}>
              <dt>Issued at</dt>
              <dd>{new Date(pass.issued_at).toLocaleDateString('ja-JP')}</dd>
            </div>
          </dl>
        </div>

        <p className={styles.note}>
          このRATA PASSは先行登録に基づく仮発行です。正式な提供開始時に、改めて正式なRATA PASSへの切り替えをご案内します。
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
