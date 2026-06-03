/* --- ميزة: الإعدادات الأساسية والحالة الثابتة (Core Configuration & State) --- */
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRj_giqJJMsxVWMvgKogUkg2pgt7r_jMJ4BVVBATNXy1g_OKZDBKKwryAevaJE1O6NekbKg0F7YZL0K/pub?output=csv';

let menuData = [];
let currentLang = 'fr';

/* --- ميزة: جلب البيانات ومعالجة النصوص الاحترافية (Robust Data Fetching) --- */
async function init() {
    try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const text = await res.text();
        
        // معالجة السطور بشكل آمن مع تفادي السطور الفارغة
        const rows = text.split(/\r?\n/).slice(1).filter(row => row.trim() !== '');
        
        menuData = rows.map(row => {
            // Regex احترافي لتقسيم السطر عبر الفواصل مع مراعاة النصوص المحاطة بعلامات تنصيص
            const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
            
            const clean = (val) => val ? val.replace(/^"|"$/g, '').trim() : '';
            
            return {
                cat_ar: clean(cols[0]),
                cat_fr: clean(cols[1]),
                sub:    clean(cols[2]),
                cat_en: clean(cols[3]),
                name_ar: clean(cols[4]),
                name_fr: clean(cols[5]),
                name_en: clean(cols[6]),
                price:   clean(cols[7])
            };
        }).filter(item => item.cat_fr); // التحقق من وجود الفئة الفرنسية كمعيار أساسي لقانونية السطر
        
        renderMain();
    } catch (err) {
        console.error("Critical Error Initialization Failed:", err);
        document.getElementById('content').innerHTML = `<p class="text-red-500 text-center p-4">Service temporarily unavailable.</p>`;
    }
}

/* --- ميزة: إدارة اللغات والاتجاهات ديناميكياً (Internationalization & Localization) --- */
function toggleLangMenu() {
    const menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('hidden');
}

function changeLanguage(lang, flag) {
    currentLang = lang;
    
    const flagElem = document.getElementById('currentFlag');
    if (flagElem) flagElem.innerText = flag;
    
    // إدارة اتجاه الصفحة بدقة كودية سلاسة (RTL للمغربي والعربي، LTR للباقي)
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    toggleLangMenu();
    renderMain();
}

/* --- ميزة: الواجهة الترحيبية النظيفة (Main Welcome View) --- */
function renderMain() {
    const content = document.getElementById('content');
    if (!content) return;

    const texts = { 
        ar: { t: 'مرحباً بكم في مقهانا', b: 'عرض القائمة' }, 
        fr: { t: 'Bienvenue chez nous', b: 'Voir le Menu' }, 
        en: { t: 'Welcome to our Cafe', b: 'View Menu' } 
    };
    
    // قمنا بحذف كود وسم الصورة تماماً بناءً على طلبك ليعتمد الهيكل بالكامل على الخلفية المحددة في index.html
    content.innerHTML = `
        <div class="text-center p-6 space-y-6">
            <h1 class="text-3xl font-bold text-gray-800 drop-shadow-sm transition-all">${texts[currentLang].t}</h1>
            <button onclick="showCategories()" class="bg-blue-600 text-white px-12 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200">
                ${texts[currentLang].b}
            </button>
        </div>
    `;
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.classList.add('hidden');
}

/* --- ميزة: منطق التنقل المستقر (Bulletproof Navigation Logic) --- */
function showCategories() {
    const content = document.getElementById('content');
    if (!content) return;

    // جلب الفئات الفريدة حسب اللغة النشطة وتفادي الفراغات
    const cats = [...new Set(menuData.map(i => i[`cat_${currentLang}`] || i.cat_fr).filter(Boolean))];
    
    content.innerHTML = cats.map(c => `
        <div class="card flex justify-between items-center bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20 transition-all hover:translate-y-[-2px]" onclick="renderSub('${c.replace(/'/g, "\\'")}')">
            <span class="font-bold text-lg text-gray-800">${c}</span>
            <span class="text-gray-400 text-sm">➡️</span>
        </div>
    `).join('');
    
    updateBackButton(renderMain);
}

function renderSub(catName) {
    const content = document.getElementById('content');
    if (!content) return;

    // فلترة المنتجات التي تنتمي للفئة المختارة بدقة تامة
    const items = menuData.filter(i => (i[`cat_${currentLang}`] || i.cat_fr) === catName);
    
    // استخراج المجموعات الفرعية (SubCategories) الصالحة فقط وتجاهل الدش وعلامات "-"
    const subs = [...new Set(items.map(i => i.sub).filter(s => s && s !== '-'))];
    
    // العمارة الهندسية الذكية لزر الرجوع: إذا قفزنا مباشرة للأصناف، نمرر المعيار الصريح
    if (subs.length === 0) {
        renderItems(catName, "", false);
        return;
    }
    
    content.innerHTML = subs.map(s => `
        <div class="card flex justify-between items-center bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20 transition-all hover:translate-y-[-2px]" onclick="renderItems('${catName.replace(/'/g, "\\'")}', '${s.replace(/'/g, "\\'")}', true)">
            <span class="font-bold text-lg text-gray-800">${s}</span>
            <span class="text-gray-400 text-sm">➡️</span>
        </div>
    `).join('');
    
    updateBackButton(showCategories);
}

function renderItems(catName, sub, hasParentSub) {
    const content = document.getElementById('content');
    if (!content) return;

    // جلب المنتجات بناءً على الفئة الرئيسية والفرعية (إن وجدت)
    const items = menuData.filter(i => 
        (i[`cat_${currentLang}`] || i.cat_fr) === catName && 
        (sub === "" ? (!i.sub || i.sub === '-') : i.sub === sub)
    );
    
    content.innerHTML = items.map(i => `
        <div class="card flex justify-between items-center bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20">
            <span class="font-bold text-gray-800">${i[`name_${currentLang}`] || i.name_fr}</span>
            <span class="text-green-700 font-extrabold px-3 py-1 bg-green-50 rounded-full text-md border border-green-100">${i.price} MAD</span>
        </div>
    `).join('');

    // تحديث زر الرجوع بناءً على مسار المستخدم الصريح لضمان عدم حدوث Loop لانهائي
    updateBackButton(hasParentSub ? () => renderSub(catName) : showCategories);
}

/* --- ميزة: الدوال المساعدة وتحسين الـ UI (Helper Utilities) --- */
function updateBackButton(callback) {
    const btn = document.getElementById('backBtn');
    if (!btn) return;
    
    btn.classList.remove('hidden');
    // إضفاء طابع لغوي سليم لزر الرجوع حسب الواجهة المحددة
    btn.innerHTML = (currentLang === 'ar') ? 'رجوع ⬅' : '⬅ Retour';
    btn.onclick = callback;
}

// إطلاق التطبيق عند الجاهزية
init();
