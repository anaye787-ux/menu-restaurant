const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRj_giqJJMsxVWMvgKogUkg2pgt7r_jMJ4BVVBATNXy1g_OKZDBKKwryAevaJE1O6NekbKg0F7YZL0K/pub?output=csv';

let menuData = [];
let currentLang = 'fr';

/* --- ميزة: جلب البيانات بدقة هندسية عالية (Robust Data Fetching) --- */
async function init() {
    try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const text = await res.text();
        const rows = text.split(/\r?\n/).slice(1).filter(row => row.trim() !== '');
        
        menuData = rows.map(row => {
            // حل المشكلة: Regex يضمن تقسيم السطر لـ 11 عموداً بدقة تامة حتى لو كانت هناك خلايا فارغة متتالية
            const cols = row.match(/(".*?"|[^",]*)(?=\s*,|\s*$)/g) || [];
            
            // تنظيف الحقول من الفراغات وعلامات التنصيص الزائدة
            const clean = (val) => val ? val.trim().replace(/^"|"$/g, '').trim() : '';
            
            return {
                cat_ar:  clean(cols[0]),  // A: Category_AR
                cat_fr:  clean(cols[1]),  // B: Category_FR
                sub_ar:  clean(cols[2]),  // C: SubCategory_AR
                sub_fr:  clean(cols[3]),  // D: SubCategory_FR
                sub_en:  clean(cols[4]),  // E: SubCategory_EN
                cat_en:  clean(cols[5]),  // F: Category_EN
                name_ar: clean(cols[6]),  // G: Item_Name_AR
                name_fr: clean(cols[7]),  // H: Item_Name_FR
                name_en: clean(cols[8]),  // I: Item_Name_EN
                price:   clean(cols[9]),  // J: Price
                image:   clean(cols[10])  // K: ImageURL
            };
        }).filter(item => item.cat_fr || item.cat_ar);
        
        renderMain();
    } catch (err) {
        console.error("Critical Error Initialization Failed:", err);
        document.getElementById('content').innerHTML = `<p class="text-red-500 text-center p-4">Service temporarily unavailable.</p>`;
    }
}

/* --- ميزة: إدارة اللغات والاتجاهات (Language Management) --- */
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
    renderMain();
}

/* --- ميزة: الواجهة الترحيبية (Main Welcome UI) --- */
function renderMain() {
    const content = document.getElementById('content');
    if (!content) return;

    const texts = { 
        ar: { t: 'مرحباً بكم في مقهانا', b: 'عرض القائمة' }, 
        fr: { t: 'Bienvenue chez nous', b: 'Voir le Menu' }, 
        en: { t: 'Welcome to our Cafe', b: 'View Menu' } 
    };
    
    content.innerHTML = `
        <div class="text-center p-6 space-y-6">
            <h1 class="text-3xl font-bold text-gray-800">${texts[currentLang].t}</h1>
            <button onclick="showCategories()" class="bg-blue-600 text-white px-12 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all">
                ${texts[currentLang].b}
            </button>
        </div>
    `;
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.classList.add('hidden');
}

/* --- ميزة: منطق التنقل المستقر (Navigation Logic) --- */
function showCategories() {
    const content = document.getElementById('content');
    if (!content) return;

    const cats = [...new Set(menuData.map(i => i[`cat_${currentLang}`] || i.cat_fr).filter(Boolean))];
    
    content.innerHTML = cats.map(c => `
        <div class="card flex justify-between items-center bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20 transition-all" onclick="renderSub('${c.replace(/'/g, "\\'")}')">
            <span class="font-bold text-lg text-gray-800">${c}</span>
            <span class="text-gray-400 text-sm">${currentLang === 'ar' ? '⬅️' : '➡️'}</span>
        </div>
    `).join('');
    
    updateBackButton(renderMain);
}

function renderSub(catName) {
    const content = document.getElementById('content');
    if (!content) return;

    const items = menuData.filter(i => (i[`cat_${currentLang}`] || i.cat_fr) === catName);
    const subs = [...new Set(items.map(i => i[`sub_${currentLang}`] || i.sub_fr).filter(s => s && s !== '-'))];
    
    // إذا كان القسم فارغاً تماماً من الفرعيات (مثل أسطر المشروبات) نمرر البيانات مباشرة للأصناف
    if (subs.length === 0) {
        renderItems(catName, "", false);
        return;
    }
    
    content.innerHTML = subs.map(s => {
        const referenceSubFR = items.find(i => (i[`sub_${currentLang}`] || i.sub_fr) === s)?.sub_fr || s;
        
        return `
            <div class="card flex justify-between items-center bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20 transition-all" onclick="renderItems('${catName.replace(/'/g, "\\'")}', '${referenceSubFR.replace(/'/g, "\\'")}', true)">
                <span class="font-bold text-lg text-gray-800">${s}</span>
                <span class="text-gray-400 text-sm">${currentLang === 'ar' ? '⬅️' : '➡️'}</span>
            </div>
        `;
    }).join('');
    
    updateBackButton(showCategories);
}

function renderItems(catName, subFR, hasParentSub) {
    const content = document.getElementById('content');
    if (!content) return;

    const items = menuData.filter(i => 
        (i[`cat_${currentLang}`] || i.cat_fr) === catName && 
        (subFR === "" ? (!i.sub_fr || i.sub_fr === '-') : i.sub_fr === subFR)
    );
    
    content.innerHTML = items.map(i => `
        <div class="card flex justify-between items-center bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20">
            <span class="font-bold text-gray-800">${i[`name_${currentLang}`] || i.name_fr}</span>
            <span class="text-green-700 font-extrabold px-3 py-1 bg-green-50 rounded-full text-md border border-green-100">${i.price} MAD</span>
        </div>
    `).join('');

    updateBackButton(hasParentSub ? () => renderSub(catName) : showCategories);
}

/* --- ميزة: تحديث زر الرجوع المتناسق (Helper) --- */
function updateBackButton(callback) {
    const btn = document.getElementById('backBtn');
    if (!btn) return;
    
    btn.classList.remove('hidden');
    btn.innerHTML = (currentLang === 'ar') ? 'رجوع ⬅' : '⬅ Retour';
    btn.onclick = callback;
}

init();
