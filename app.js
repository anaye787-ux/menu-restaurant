window.addEventListener('popstate', (event) => {
    // 1. تنظيف حقل البحث دائماً عند التنقل بين الحالات
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.getElementById('searchContainer');
    if (searchInput) searchInput.value = '';
    if (searchContainer) searchContainer.classList.add('hidden');

    // 2. فك تشفير الحالة والعودة للخلف بناءً على البيانات المخزنة
    if (event.state && event.state.view) {
        const { view, cat, sub, parent } = event.state;
        
        if (view === 'main') {
            renderMain();
        } else if (view === 'cats') {
            showCategories();
        } else if (view === 'sub') {
            renderSub(cat);
        } else if (view === 'items') {
            // نستخدم القيمة المخزنة في parent لمعرفة كيفية العرض
            renderItems(cat, sub, parent === 'sub');
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
    
    // عند تغيير اللغة نعيد ضبط الحالة لتجنب تداخل التاريخ
    history.replaceState({ view: 'main' }, '', '');
    renderMain();
}

// تحديث الزر: أصبح الآن موحداً ولا يحتاج لـ callback
function updateBackButton() {
    const btn = document.getElementById('backBtn');
    if (!btn) return;
    
    btn.classList.remove('hidden');
    btn.innerHTML = (currentLang === 'ar') ? 'رجوع ⬅' : '⬅ Retour';
    
    // الزر الآن يطلب من المتصفح تنفيذ حركة "الرجوع" الحقيقية فقط
    btn.onclick = () => history.back();
}

// إشارة البدء
init();
