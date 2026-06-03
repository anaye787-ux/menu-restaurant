/** * الإعدادات الأساسية والرابط 
 **/
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRj_giqJJMsxVWMvgKogUkg2pgt7r_jMJ4BVVBATNXy1g_OKZDBKKwryAevaJE1O6NekbKg0F7YZL0K/pub?output=csv';
let menuData = [];
let currentLang = 'fr';

/* --- ميزة: جلب البيانات (Data Fetching) --- */
async function init() {
    try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        menuData = text.split('\n').slice(1).map(row => {
            const cols = row.split(',');
            return {
                cat_ar: cols[0]?.trim(), cat_fr: cols[1]?.trim(), cat_en: cols[3]?.trim(),
                sub: cols[2]?.trim(),
                name_ar: cols[4]?.trim(), name_fr: cols[5]?.trim(), name_en: cols[6]?.trim(),
                price: cols[7]?.trim()
            };
        }).filter(item => item.cat_fr);
        renderMain();
    } catch (err) { console.error("Error fetching data:", err); }
}

/* --- ميزة: إدارة اللغات (Language Management) --- */
function toggleLangMenu() { document.getElementById('langMenu').classList.toggle('hidden'); }

function changeLanguage(lang, flag) {
    currentLang = lang;
    document.getElementById('currentFlag').innerText = flag;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    toggleLangMenu();
    renderMain();
}

/* --- ميزة: عرض الواجهة الترحيبية (Main UI) --- */
function renderMain() {
    const content = document.getElementById('content');
    const texts = { ar: {t:'مرحباً بكم في مقهانا', b:'عرض القائمة'}, fr: {t:'Bienvenue chez nous', b:'Voir le Menu'}, en: {t:'Welcome to our Cafe', b:'View Menu'} };
    
    content.innerHTML = `
        <div class="text-center p-6 space-y-4">
            <h1 class="text-2xl font-bold text-gray-800">${texts[currentLang].t}</h1>
            <button onclick="showCategories()" class="bg-blue-600 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">
                ${texts[currentLang].b}
            </button>
        </div>
    `;
    document.getElementById('backBtn').classList.add('hidden');
}

/* --- ميزة: التنقل بين الأقسام (Navigation Logic) --- */
function showCategories() {
    const cats = [...new Set(menuData.map(i => i[`cat_${currentLang}`] || i.cat_fr))];
    const content = document.getElementById('content');
    content.innerHTML = cats.map(c => `<div class="card" onclick="renderSub('${c}')"><span class="font-bold text-lg">${c}</span></div>`).join('');
    
    updateBackButton(renderMain);
}

function renderSub(catName) {
    const items = menuData.filter(i => (i[`cat_${currentLang}`] || i.cat_fr) === catName);
    const subs = [...new Set(items.map(i => i.sub).filter(s => s && s !== '-'))];
    
    if (subs.length === 0) { renderItems(catName, ""); return; }
    
    const content = document.getElementById('content');
    content.innerHTML = subs.map(s => `<div class="card" onclick="renderItems('${catName}', '${s}')"><span class="font-bold text-lg">${s}</span></div>`).join('');
    updateBackButton(showCategories);
}

function renderItems(catName, sub) {
    const items = menuData.filter(i => (i[`cat_${currentLang}`] || i.cat_fr) === catName && (i.sub === sub || !i.sub));
    const content = document.getElementById('content');
    content.innerHTML = items.map(i => `
        <div class="card flex justify-between items-center">
            <span class="font-bold">${i[`name_${currentLang}`] || i.name_fr}</span>
            <span class="text-green-700 font-bold">${i.price} MAD</span>
        </div>
    `).join('');
    
    // زر الرجوع ذكي: إذا كانت هناك تصنيفات فرعية يعود لها، وإلا يعود للتصنيفات الرئيسية
    updateBackButton(() => {
        const subs = [...new Set(menuData.filter(i => (i[`cat_${currentLang}`] || i.cat_fr) === catName).map(i => i.sub).filter(s => s && s !== '-'))];
        subs.length > 0 ? renderSub(catName) : showCategories();
    });
}

/* --- ميزة: المساعدة (Helper Functions) --- */
function updateBackButton(callback) {
    const btn = document.getElementById('backBtn');
    btn.classList.remove('hidden');
    btn.innerHTML = (currentLang === 'ar') ? 'رجوع ⬅' : '⬅ Retour';
    btn.onclick = callback;
}

init();
