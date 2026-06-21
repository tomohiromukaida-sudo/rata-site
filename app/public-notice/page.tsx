import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: '公告情報 — 一般社団法人リジェネラティブアートツーリズム協会',
  description:
    '一般社団法人リジェネラティブアートツーリズム協会（RATA）の公告情報。当法人は定款の定めに基づき電子公告により公告を行います。',
};

export default function PublicNoticePage() {
  return (
    <div className="page">
      <SiteNav current="/public-notice" />

      <main className={styles.main}>
        <div className={styles.pageHero}>
          <p className={styles.eyebrow}>Public Notice</p>
          <h1 className={styles.pageTitle}>
            公告<strong>情報</strong>
          </h1>
          <p className={styles.pageSub}>Public Notice</p>
        </div>

        <div className={styles.divider} />

        <section className={styles.section}>
          <p className={styles.body}>
            一般社団法人リジェネラティブアートツーリズム協会は、定款の定めに基づき、当法人の公告を本ページに掲載します。
          </p>
          <p className={styles.body}>
            なお、事故その他やむを得ない事由により電子公告を行うことができない場合は、官報に掲載する方法により公告します。
          </p>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <p className={styles.eyebrow}>公告方法</p>
          <h2 className={styles.sectionTitle}>
            <strong>Method of Public Notice</strong>
          </h2>
          <dl className={styles.orgTable}>
            <div className={styles.orgRow}>
              <dt>公告方法</dt>
              <dd>電子公告</dd>
            </div>
            <div className={styles.orgRow}>
              <dt>代替方法</dt>
              <dd>官報掲載</dd>
            </div>
          </dl>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <p className={styles.eyebrow}>Notices</p>
          <h2 className={styles.sectionTitle}>
            <strong>公告一覧</strong>
          </h2>
          <div className={styles.noticeRow}>
            <div className={styles.meta}>
              <span className={styles.date}>2026年2月28日</span>
              第1期 決算公告（貸借対照表）
            </div>
            <a href="/notices/2026-kessan.pdf" target="_blank" rel="noopener">
              PDFを見る
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
