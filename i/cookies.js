const COOKIE_KEY = 'mu-cookie-consent';
const GA_ID = 'G-QDZETE8CY9';

// Dynamicznie ładuje GA4 - wywoływane tylko po zgodzie
function loadGA4() {
    if (window._ga4Loaded) return; // zabezpieczenie przed podwójnym wstrzyknięciem
    window._ga4Loaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
}

// Przy załadowaniu strony — sprawdź czy consent już zapisany
document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookieBanner');
    const consent = localStorage.getItem(COOKIE_KEY);

    if (!banner) return;

    if (consent === 'accepted') {
        loadGA4();
        banner.style.display = 'none';
    } else if (consent === 'rejected') {
        banner.style.display = 'none';
    }
});

function handleCookie(agreed) {
    const banner = document.getElementById('cookieBanner');
    if (agreed) {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        loadGA4();
    } else {
        localStorage.setItem(COOKIE_KEY, 'rejected');
        // GA4 się nie ładuje — nic więcej nie robimy
    }
    banner.style.display = 'none';
}