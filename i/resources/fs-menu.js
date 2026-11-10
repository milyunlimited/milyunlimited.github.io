// Menu fullscreen (mobile + desktop)
(function () {
    const menu = document.getElementById('fsMenu');
    if (!menu) return;
    const openers = [document.getElementById('burgerBtn'), document.getElementById('burgerDesktop')].filter(Boolean);
    const closeBtn = document.getElementById('fsMenuClose');
    const accs = menu.querySelectorAll('.fs-acc');
    let lastFocus = null;

    function setAcc(acc, open) {
        acc.classList.toggle('is-open', open);
        acc.querySelector('.fs-acc__btn').setAttribute('aria-expanded', open);
    }
    function setOpen(open) {
        if (open === menu.classList.contains('is-open')) return;
        menu.classList.toggle('is-open', open);
        menu.toggleAttribute('inert', !open);
        menu.setAttribute('aria-hidden', !open);
        document.body.classList.toggle('fs-menu-open', open);
        openers.forEach(b => b.setAttribute('aria-expanded', open));
        if (open) {
            lastFocus = document.activeElement;
            requestAnimationFrame(() => closeBtn.focus({ preventScroll: true }));
        } else {
            accs.forEach(a => setAcc(a, false));
            if (lastFocus) lastFocus.focus({ preventScroll: true });
        }
    }

    openers.forEach(b => b.addEventListener('click', () => setOpen(true)));
    closeBtn.addEventListener('click', () => setOpen(false));

    // rozwijanie sekcji z plusem (jedna otwarta naraz)
    accs.forEach(acc => acc.querySelector('.fs-acc__btn').addEventListener('click', () => {
        const willOpen = !acc.classList.contains('is-open');
        accs.forEach(a => setAcc(a, false));
        setAcc(acc, willOpen);
    }));

    // kliknięcie w link zamyka menu
    menu.addEventListener('click', e => { if (e.target.closest('a[href]')) setOpen(false); });

    document.addEventListener('keydown', e => {
        if (!menu.classList.contains('is-open')) return;
        if (document.querySelector('.lang-modal-overlay.open')) return; // okno języka ma pierwszeństwo
        if (e.key === 'Escape') { setOpen(false); return; }
        if (e.key === 'Tab') { // zatrzymaj focus w menu
            const f = [...menu.querySelectorAll('a[href], button')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
})();
