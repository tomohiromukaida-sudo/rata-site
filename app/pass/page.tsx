import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'RATA PASS — Regenerative Art Tourism Association',
  description:
    '徳之島Ocean Gaiaの再生を見守るデジタルパス「RATA PASS」。先行登録受付中。',
};

const FEATURES = [
  {
    icon: '🌱',
    title: 'Ocean Gaiaの成長記録を受け取る',
    body: 'サンゴの着床、海の変化、生きものの観察記録を定期的にお届けします。',
  },
  {
    icon: '🪪',
    title: 'デジタル参加証を持つ',
    body: '徳之島Ocean Gaiaの再生ストーリーに参加した証として、専用のRATA PASS IDを発行します。',
  },
  {
    icon: '📷',
    title: '限定アップデートを閲覧する',
    body: '一般公開前のレポート、写真、制作・保全の舞台裏をお届けします。',
  },
  {
    icon: '🎟',
    title: '徳之島での特別体験に優先案内',
    body: '現地ツアー、環境学習、アーティスト関連企画などを優先的にご案内します。',
  },
];

export default function PassPage() {
  return (
    <div className="page">
      <SiteNav current="/pass" />

      <main className={styles.main}>
        <div className={styles.pageHero}>
          <p className={styles.eyebrow}>RATA PASS</p>
          <h1 className={styles.pageTitle}>
            体験後も、
            <br />
            <strong>海の再生を見守る。</strong>
          </h1>
          <p className={styles.pageSub}>
            あなたの体験を「環境再生への参加記録」として可視化するデジタルパスです。
          </p>
        </div>

        <div className={styles.divider} />

        <section className={styles.section} style={{ paddingTop: 40 }}>
          <p className={styles.body}>
            RATA PASSは現在、正式な提供開始に向けて先行登録を受け付けています。先行登録いただいた方には、仮のRATA PASS
            IDを発行し、正式リリース時に優先的にご案内します。
          </p>

          <div className={styles.featureList}>
            {FEATURES.map((f) => (
              <div className={styles.feature} key={f.title}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureText}>
                  <p>{f.title}</p>
                  <p>{f.body}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/pass/register" className={styles.btnPrimary}>
            RATA PASS先行登録に進む
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
