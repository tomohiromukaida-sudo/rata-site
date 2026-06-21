/**
 * RATA PASS 広告計測共通スクリプト
 *
 * - URLからUTM等を取得し、初回流入(first-touch)と直近(last-touch)を
 *   localStorageに保存する
 * - GA4 (gtag) / dataLayer (GTM) / Meta Pixel (fbq) に共通イベントを送る
 * - CTAクリック・言語切替・外部リンククリック・フォーム開始/送信/エラーを
 *   自動計測する
 *
 * UTM等が無い場合やlocalStorageが使えない場合でもエラーにならないよう、
 * すべての処理をtry/catchで保護している。
 */
(function () {
  'use strict';

  var STORAGE_FIRST = 'rata_utm_first_touch';
  var STORAGE_LAST = 'rata_utm_last_touch';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function safeGet(key) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* ignore — private mode / storage full / disabled */
    }
  }

  function getDeviceType() {
    var ua = navigator.userAgent || '';
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      return /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  function currentUtmFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var utm = {};
    var hasAny = false;
    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) {
        utm[key] = value;
        hasAny = true;
      }
    });
    return hasAny ? utm : null;
  }

  function buildTouchPayload(utm) {
    return {
      utm_source: utm.utm_source || '',
      utm_medium: utm.utm_medium || '',
      utm_campaign: utm.utm_campaign || '',
      utm_content: utm.utm_content || '',
      utm_term: utm.utm_term || '',
      landing_page: window.location.pathname + window.location.search,
      referrer: document.referrer || '',
      timestamp: new Date().toISOString(),
    };
  }

  // 初回流入(first-touch)は一度保存したら上書きしない。
  // 直近(last-touch)はUTM付きで来訪するたびに更新する。
  function persistUtm() {
    var utm = currentUtmFromUrl();
    if (!utm) return;

    var payload = buildTouchPayload(utm);

    if (!safeGet(STORAGE_FIRST)) {
      safeSet(STORAGE_FIRST, payload);
    }
    safeSet(STORAGE_LAST, payload);
  }

  function getStoredTouch() {
    return safeGet(STORAGE_LAST) || safeGet(STORAGE_FIRST) || {};
  }

  function getFirstTouch() {
    return safeGet(STORAGE_FIRST) || {};
  }

  // フォーム保存・計測イベントの両方で使う「広告由来メタ情報」をまとめて返す。
  function getAdMeta() {
    var last = getStoredTouch();
    var first = getFirstTouch();
    return {
      utm_source: last.utm_source || '',
      utm_medium: last.utm_medium || '',
      utm_campaign: last.utm_campaign || '',
      utm_content: last.utm_content || '',
      utm_term: last.utm_term || '',
      first_landing_page: first.landing_page || (window.location.pathname + window.location.search),
      current_landing_page: window.location.pathname + window.location.search,
      referrer: first.referrer || document.referrer || '',
      ad_region: inferAdRegion(last.utm_campaign || first.utm_campaign || ''),
      ad_concept: last.utm_content || first.utm_content || '',
      ad_language: document.documentElement.lang || '',
    };
  }

  // utm_campaign の命名規則 (rata_pass_[region]_phase1_...) からregionを推測する。
  function inferAdRegion(campaign) {
    if (!campaign) return '';
    if (campaign.indexOf('tw_hk') !== -1) return 'tw_hk';
    if (campaign.indexOf('_sg_') !== -1) return 'sg';
    if (campaign.indexOf('_jp_') !== -1) return 'jp';
    if (campaign.indexOf('retarget') !== -1) return 'retarget';
    return '';
  }

  function pushEvent(eventName, params) {
    params = params || {};
    var adMeta = getAdMeta();
    var common = {
      event_name: eventName,
      page_path: window.location.pathname,
      page_title: document.title,
      utm_source: adMeta.utm_source,
      utm_medium: adMeta.utm_medium,
      utm_campaign: adMeta.utm_campaign,
      utm_content: adMeta.utm_content,
      utm_term: adMeta.utm_term,
      ad_region: adMeta.ad_region,
      ad_concept: adMeta.ad_concept,
      language: document.documentElement.lang || '',
      timestamp: new Date().toISOString(),
    };
    var merged = Object.assign({}, common, params);

    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: eventName }, merged));
    } catch (e) {
      /* ignore */
    }

    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, merged);
      }
    } catch (e) {
      /* ignore */
    }

    try {
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', eventName, merged);
      }
    } catch (e) {
      /* ignore */
    }
  }

  // CTAクリック計測: テキストで対象を判定する（HTML側の変更を最小化するため）。
  var CTA_LABELS = [
    'RATAパス先行案内に登録する',
    '先行案内に登録する',
    'RATA PASSを見る',
    'Ocean Gaiaを見る',
    'お問い合わせ',
    // EN
    'Pre-Register for the RATA Pass',
    'Join the early list',
    // zh-TW
    '先行登記 RATA Pass',
    '登記先行通知',
  ];

  function bindCtaTracking() {
    document.addEventListener(
      'click',
      function (e) {
        var el = e.target.closest && e.target.closest('a, button');
        if (!el) return;
        var label = (el.textContent || '').trim();
        if (!label) return;
        var matched = CTA_LABELS.some(function (l) {
          return label.indexOf(l) !== -1;
        });
        if (matched) {
          pushEvent('cta_click', { cta_label: label });
        }
      },
      true
    );
  }

  // 外部リンククリック計測。
  function bindOutboundTracking() {
    document.addEventListener(
      'click',
      function (e) {
        var el = e.target.closest && e.target.closest('a[href]');
        if (!el) return;
        var href = el.getAttribute('href') || '';
        if (!/^https?:\/\//i.test(href)) return;
        try {
          var url = new URL(href, window.location.href);
          if (url.hostname === window.location.hostname) return;
          pushEvent('outbound_click', { outbound_url: href });
        } catch (e2) {
          /* ignore malformed URL */
        }
      },
      true
    );
  }

  // 言語切替計測 (.lang-switch 内のリンク)。
  function bindLanguageSwitchTracking() {
    document.addEventListener(
      'click',
      function (e) {
        var el = e.target.closest && e.target.closest('.lang-switch a');
        if (!el) return;
        pushEvent('language_switch', {
          target_language: (el.textContent || '').trim(),
          target_href: el.getAttribute('href') || '',
        });
      },
      true
    );
  }

  // フォーム開始/送信/エラー計測。data-form-name属性、無ければid/nameで代用する。
  function bindFormTracking() {
    var forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
      var formName = form.getAttribute('data-form-name') || form.id || form.getAttribute('name') || 'form';
      var started = false;

      form.addEventListener(
        'focusin',
        function () {
          if (started) return;
          started = true;
          pushEvent('form_start', { form_name: formName });
        },
        true
      );

      // form_submit / form_error は実際の送信結果（fetch成否）に応じて
      // 各ページのスクリプト側からRataTracking.trackFormSubmit/trackFormError
      // を呼び出す想定。ここでは標準submit（fetchを使わないフォーム用）のみ補足する。
      form.addEventListener('submit', function () {
        if (form.getAttribute('data-tracked-submit') === 'true') return; // fetch側で計測済み
        pushEvent('form_submit', { form_name: formName });
      });
    });
  }

  function getFormPayloadFields() {
    var adMeta = getAdMeta();
    return {
      utm_source: adMeta.utm_source,
      utm_medium: adMeta.utm_medium,
      utm_campaign: adMeta.utm_campaign,
      utm_content: adMeta.utm_content,
      utm_term: adMeta.utm_term,
      first_landing_page: adMeta.first_landing_page,
      referrer: adMeta.referrer,
      ad_region: adMeta.ad_region,
      ad_concept: adMeta.ad_concept,
      ad_language: adMeta.ad_language,
      browser_language: navigator.language || '',
      device_type: getDeviceType(),
      screen_width: window.screen ? window.screen.width : null,
      screen_height: window.screen ? window.screen.height : null,
      user_agent: navigator.userAgent || '',
      submitted_at: new Date().toISOString(),
    };
  }

  function init() {
    try {
      persistUtm();
    } catch (e) {
      /* ignore */
    }
    bindCtaTracking();
    bindOutboundTracking();
    bindLanguageSwitchTracking();
    bindFormTracking();
    pushEvent('page_view', {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.RataTracking = {
    pushEvent: pushEvent,
    getAdMeta: getAdMeta,
    getFormPayloadFields: getFormPayloadFields,
  };
})();
