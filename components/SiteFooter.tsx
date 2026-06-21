import Link from 'next/link';
import Image from 'next/image';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoRow}>
        <Image src="/images/logo-white.png" alt="RATA logo" width={22} height={22} />
        <span style={{ fontSize: 11, letterSpacing: 2, fontWeight: 500 }}>RATA</span>
      </div>
      <p className={styles.text}>
        一般社団法人 リジェネラティブアートツーリズム協会
        <br />
        Regenerative Art Tourism Association
        <br />
        © 2025 RATA Japan. All Rights Reserved.
      </p>
      <div className={styles.links}>
        <Link href="/about">About RATA</Link>
        <Link href="/public-notice">公告情報</Link>
        <Link href="/pass">RATA PASS</Link>
        <a href="mailto:info@rata.jp">お問い合わせ</a>
      </div>
    </footer>
  );
}
