import { supabaseAdmin } from '@/lib/supabaseAdmin';
import styles from './page.module.css';

// NOTE: This page has NO authentication yet. It is acceptable only because
// the MVP is not linked from public navigation and the URL is not shared.
// Before this goes to production, gate this route — e.g. middleware.ts
// checking a Basic-Auth header or a Supabase-authenticated admin session —
// and never deploy this page publicly accessible without that check.

export const dynamic = 'force-dynamic';

type WaitlistRow = {
  id: string;
  pass_code: string;
  email: string;
  name: string | null;
  country: string | null;
  language: string | null;
  visit_intent: string | null;
  price_range: string | null;
  created_at: string;
};

export default async function AdminWaitlistPage() {
  const { data, error } = await supabaseAdmin
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  const rows = (data as WaitlistRow[]) || [];

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>RATA PASS Waitlist</h1>
      <p className={styles.sub}>登録件数: {rows.length}件</p>

      {error && <p className={styles.empty}>取得エラー: {error.message}</p>}

      {!error && rows.length === 0 && <p className={styles.empty}>登録はまだありません。</p>}

      {!error && rows.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>登録日時</th>
              <th>Pass ID</th>
              <th>メール</th>
              <th>氏名</th>
              <th>国・地域</th>
              <th>言語</th>
              <th>訪問意向</th>
              <th>価格帯</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.created_at).toLocaleString('ja-JP')}</td>
                <td>{row.pass_code}</td>
                <td>{row.email}</td>
                <td>{row.name || ''}</td>
                <td>{row.country || ''}</td>
                <td>{row.language || ''}</td>
                <td>{row.visit_intent || ''}</td>
                <td>{row.price_range || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
