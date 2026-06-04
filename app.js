// --- مدير حالة التنقل ---
window.addEventListener('popstate', (event) => {
    // 1. تنظيف حقل البحث دائماً عند التنقل بين الحالات
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.getElementById('searchContainer');
    if (searchInput) searchInput.value = '';
    if (searchContainer) searchContainer.classList.add('hidden');

    // 2. فك تشفير الحالة والعودة للخلف
    if (event.state && event.state.view) {
        const { view, cat, sub } = event.state;
        
        // تنفيذ دالة الرسم بناءً على الحالة المسترجعة
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
        // إذا لم توجد حالة (يعني المستخدم في الصفحة الأولى)، عد للرئيسية
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

// تحديث الزر: أصبح الآن بسيطاً ومباشراً
function updateBackButton() {
    const btn = document.getElementById('backBtn');
    if (!btn) return;
    
    btn.classList.remove('hidden');
    btn.innerHTML = (currentLang === 'ar') ? 'رجوع ⬅' : '⬅ Retour';
    
    // الزر الآن يطلب من المتصفح تنفيذ حركة "الرجوع" الحقيقية
    btn.onclick = () => history.back();
}

// إشارة البدء
init();
