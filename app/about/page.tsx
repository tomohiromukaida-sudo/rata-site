import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About RATA — 一般社団法人リジェネラティブアートツーリズム協会',
  description:
    '一般社団法人リジェネラティブアートツーリズム協会（RATA）の団体概要。環境再生型アートを軸に、観光・自然環境・地域文化・教育・地方創生をつなぐ活動について。',
};

export default function AboutPage() {
  return (
    <div className="page">
      <SiteNav current="/about" />

      <main className={styles.main}>
        <div className={styles.pageHero}>
          <p className={styles.eyebrow}>About RATA</p>
          <h1 className={styles.pageTitle}>
            About <strong>RATA</strong>
          </h1>
          <p className={styles.pageSub}>アートを通じて、自然・地域・旅の関係を再生する。</p>
        </div>

        <div className={styles.divider} />

        <section className={styles.section}>
          <p className={styles.body}>
            一般社団法人リジェネラティブアートツーリズム協会（RATA）は、環境再生型アートを軸に、観光、自然環境、地域文化、教育、地方創生をつなぐために設立された団体です。
          </p>
          <p className={styles.body}>
            私たちは、旅を単なる消費体験ではなく、訪れるほどに自然や地域がより良い状態へ向かう「リジェネラティブな体験」へと進化させることを目指しています。
          </p>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <p className={styles.eyebrow}>Organization Profile</p>
          <h2 className={styles.sectionTitle}>
            <strong>団体概要</strong>
          </h2>
          <dl className={styles.orgTable}>
            <div className={styles.orgRow}>
              <dt>団体名</dt>
              <dd>一般社団法人リジェネラティブアートツーリズム協会</dd>
            </div>
            <div className={styles.orgRow}>
              <dt>英語名</dt>
              <dd>Regenerative Art Tourism Association</dd>
            </div>
            <div className={styles.orgRow}>
              <dt>略称</dt>
              <dd>RATA</dd>
            </div>
            <div className={styles.orgRow}>
              <dt>所在地</dt>
              <dd>東京都足立区</dd>
            </div>
            <div className={styles.orgRow}>
              <dt>事業領域</dt>
              <dd>環境再生型アート、地方創生、観光、教育、アーティスト連携</dd>
            </div>
          </dl>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
