'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function ThanksContent() {
  const searchParams = useSearchParams();
  const passCode = searchParams.get('pass_code');

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        ご登録
        <strong>ありがとうございます</strong>
      </h1>

      {passCode && (
        <div className={styles.passCard}>
          <p className={styles.passLabel}>Your RATA PASS ID（仮発行）</p>
          <p className={styles.passCode}>{passCode}</p>
        </div>
      )}

      <p className={styles.body}>
        RATA PASS先行登録を受け付けました。
        <br />
        正式な提供開始が近づきましたら、優先的にご案内いたします。
      </p>

      <Link href="/" className={styles.btn}>
        トップページへ戻る
      </Link>
    </main>
  );
}
