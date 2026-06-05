window.addEventListener('popstate', (event) => {
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.getElementById('searchContainer');
    if (searchInput) searchInput.value = '';
    if (searchContainer) searchContainer.classList.add('hidden');

    if (event.state && event.state.view) {
        const { view, cat, sub } = event.state;
        
        if (view === 'main') {
            renderMain();
        } else if (view === 'cats') {
            showCategories();
        } else if (view === 'sub') {
            renderSub(cat);
        } else if (view === 'items') {
            renderItems(cat, sub, true);
        }
    } else {
        renderMain();
    }
});

function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('hidden');
}

function changeLanguage(lang, flag) {
    currentLang = lang;
    const flagElem = document.getElementById('currentFlag');
    if (flagElem) flagElem.innerText = flag;
    
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    toggleLangMenu();
    
    history.replaceState({ view: 'main' }, '', '');
    renderMain();
}

function updateBackButton() {
    const btn = document.getElementById('backBtn');
    if (!btn) return;
    
    btn.classList.remove('hidden');
    btn.innerHTML = (currentLang === 'ar') ? 'رجوع ⬅' : '⬅ Retour';
    
    btn.onclick = () => history.back();
}

init();
