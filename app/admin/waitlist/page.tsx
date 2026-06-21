import { getTursoClient } from '@/lib/turso';
import styles from './page.module.css';

// NOTE: This page has NO authentication yet. It is gated only by the
// ADMIN_ENABLED env var (set to anything other than "true" to hide it), and
// is not linked from public navigation. Before this goes to production,
// add real auth — e.g. middleware.ts checking a Basic-Auth header or a
// session — and never deploy this page publicly reachable without it.

export const dynamic = 'force-dynamic';

type WaitlistRow = {
  id: number;
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
  if (process.env.ADMIN_ENABLED !== 'true') {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>RATA PASS Waitlist</h1>
        <p className={styles.empty}>
          このページは現在無効化されています（ADMIN_ENABLED=trueを設定すると表示されます）。
        </p>
      </div>
    );
  }

  let rows: WaitlistRow[] = [];
  let errorMessage: string | null = null;

  try {
    const db = getTursoClient();
    const result = await db.execute(
      'SELECT * FROM waitlist ORDER BY created_at DESC LIMIT 200'
    );
    rows = result.rows as unknown as WaitlistRow[];
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。';
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>RATA PASS Waitlist</h1>
      <p className={styles.sub}>登録件数: {rows.length}件</p>

      {errorMessage && <p className={styles.empty}>取得エラー: {errorMessage}</p>}

      {!errorMessage && rows.length === 0 && <p className={styles.empty}>登録はまだありません。</p>}

      {!errorMessage && rows.length > 0 && (
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
