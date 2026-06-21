import Link from 'next/link';
import Image from 'next/image';
import styles from './SiteNav.module.css';

const NAV_LINKS = [
  { href: '/about', label: 'About RATA' },
  { href: '/public-notice', label: '公告情報' },
  { href: '/pass', label: 'RATA PASS' },
];

export default function SiteNav({ current }: { current?: string }) {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        <Image src="/images/logo-white.png" alt="RATA logo" width={26} height={26} />
        <span className={styles.logoText}>RATA</span>
      </Link>
      <div className={styles.links}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={current === link.href ? styles.active : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
