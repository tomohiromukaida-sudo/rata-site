import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className="page">
      <SiteNav current="/" />

      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Tokunoshima · UNESCO World Natural Heritage</p>
          <h1 className={styles.title}>
            <strong>アートで、</strong>
            <br />
            海が再生する。
          </h1>
          <p className={styles.sub}>
            Jason deCaires Taylor が設置した日本初の環境再生型水中彫刻「Ocean Gaia」。
            体験の証として、RATA PASSが海の変化を見守ります。
          </p>
          <Link href="/pass" className={styles.btnPrimary}>
            RATA PASSを見る
          </Link>
        </div>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <p className={styles.eyebrow}>Ocean Gaia</p>
        <h2 className={styles.sectionTitle}>
          徳之島の海に
          <br />
          <strong>沈む彫刻を訪れる</strong>
        </h2>
        <p className={styles.sectionBody}>
          ダイビングまたはシュノーケルで「Ocean Gaia」に出会い、珊瑚が着床し生態系が回復していくプロセスを体感する旅。世界自然遺産・徳之島の海でしか出会えない体験です。
        </p>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <p className={styles.eyebrow}>RATA PASS</p>
        <h2 className={styles.sectionTitle}>
          体験後も、
          <br />
          <strong>海の再生を見守る。</strong>
        </h2>
        <p className={styles.sectionBody}>
          RATA PASSは、あなたの体験を「環境再生への参加記録」として可視化するデジタルパスです。
        </p>
        <div className={styles.card}>
          <span className={styles.badge}>RATA PASS Lite</span>
          <p className={styles.cardTitle}>先行登録受付中</p>
          <p className={styles.cardSub}>仮のRATA PASS IDを今すぐ発行できます。</p>
          <Link href="/pass/register" className={styles.btnPrimary} style={{ marginTop: 16 }}>
            先行登録に進む
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
