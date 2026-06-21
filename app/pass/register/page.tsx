'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import styles from './page.module.css';

export default function PassRegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      country: data.get('country'),
      language: data.get('language'),
      interest: data.get('interest'),
      visit_intent: data.get('visit_intent'),
      price_range: data.get('price_range'),
    };

    try {
      const res = await fetch('/api/pass/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || '登録処理中にエラーが発生しました。');
        setSubmitting(false);
        return;
      }

      router.push(`/pass/thanks?code=${encodeURIComponent(json.pass_code)}`);
    } catch (err) {
      console.error(err);
      setError('登録処理中にエラーが発生しました。');
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <SiteNav current="/pass" />

      <main className={styles.main}>
        <div className={styles.pageHero}>
          <p className={styles.eyebrow}>Pre-Registration</p>
          <h1 className={styles.pageTitle}>
            RATA PASS
            <br />
            <strong>先行登録</strong>
          </h1>
          <p className={styles.pageSub}>
            正式リリースに先立ち、仮のRATA PASS IDを発行します。本登録は正式な購入・予約ではありません。
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.group}>
            <label className={styles.label} htmlFor="name">
              氏名
            </label>
            <input className={styles.input} id="name" name="name" type="text" />
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="email">
              メールアドレス<span className={styles.req}>必須</span>
            </label>
            <input className={styles.input} id="email" name="email" type="email" required />
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="country">
              居住国・地域
            </label>
            <input className={styles.input} id="country" name="country" type="text" />
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="language">
              希望言語
            </label>
            <select className={styles.select} id="language" name="language" defaultValue="ja">
              <option value="ja">日本語</option>
              <option value="en">English</option>
              <option value="zh-TW">中文</option>
            </select>
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="interest">
              興味のある体験
            </label>
            <input
              className={styles.input}
              id="interest"
              name="interest"
              type="text"
              placeholder="例：ダイビング、シュノーケル、環境教育"
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="visit_intent">
              徳之島への訪問意向
            </label>
            <select className={styles.select} id="visit_intent" name="visit_intent" defaultValue="">
              <option value="">選択してください</option>
              <option value="planning">具体的に計画中</option>
              <option value="interested">興味はあるがまだ未定</option>
              <option value="no_plan">訪問予定はない</option>
            </select>
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="price_range">
              支払ってもよい価格帯
            </label>
            <select className={styles.select} id="price_range" name="price_range" defaultValue="">
              <option value="">選択してください</option>
              <option value="under_1000">1,000円未満</option>
              <option value="1000_3000">1,000〜3,000円</option>
              <option value="3000_5000">3,000〜5,000円</option>
              <option value="over_5000">5,000円以上</option>
            </select>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button className={styles.btnPrimary} type="submit" disabled={submitting}>
            {submitting ? '送信中...' : '先行登録する'}
          </button>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
