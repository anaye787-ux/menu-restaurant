function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('hidden');
}

// معالجة تغيير اللغة والاتجاه الجغرافي للمنيو (RTL / LTR) بشكل ديناميكي كامل
function changeLanguage(lang, flag) {
    currentLang = lang;
    const flagElem = document.getElementById('currentFlag');
    if (flagElem) flagElem.innerText = flag;
    
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    toggleLangMenu();
    renderMain();
}

// تحديث ذكي ومستقر لزر الرجوع حسب وضعية التصفح واللغة الحالية
function updateBackButton(callback) {
    const btn = document.getElementById('backBtn');
    if (!btn) return;
    
    btn.classList.remove('hidden');
    btn.innerHTML = (currentLang === 'ar') ? 'رجوع ⬅' : '⬅ Retour';
    btn.onclick = callback;
}

// إشارة البدء: انطلاق جلب البيانات فور تحميل الصفحة وسيرفرات جيت هاب
init();
