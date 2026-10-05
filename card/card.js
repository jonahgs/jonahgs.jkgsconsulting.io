(function () {
  'use strict';

  var isTest = new URLSearchParams(window.location.search).get('test') === '1';
  var source = isTest ? 'business_card_test' : 'business_card';
  var website = new URL('https://jkgsconsulting.com/');
  website.searchParams.set('utm_source', source);
  website.searchParams.set('utm_medium', 'qr');
  website.searchParams.set('utm_campaign', source);
  document.querySelectorAll('[data-website-link]').forEach(function (link) {
    link.href = website.href;
  });

  // Local previews never send events. Live checks use ?test=1.
  if (window.location.hostname !== 'jkgsconsulting.com' &&
      window.location.hostname !== 'www.jkgsconsulting.com') return;

  // Count one card event per document, even if this script is loaded twice.
  if (window.__jkgsCardAnalyticsLoaded) return;
  window.__jkgsCardAnalyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-R0ZM6XL6X2', {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: 'https://jkgsconsulting.com/card',
    page_referrer: '',
    campaign_source: source,
    campaign_medium: 'qr',
    campaign_name: source
  });
  gtag('event', isTest ? 'business_card_test' : 'business_card_visit', {
    send_to: 'G-R0ZM6XL6X2',
    page_location: 'https://jkgsconsulting.com/card',
    page_title: 'JKGS business card',
    page_referrer: ''
  });

  // The page and booking link work independently of analytics loading.
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=G-R0ZM6XL6X2';
  document.head.appendChild(tag);
}());
