const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRj_giqJJMsxVWMvgKogUkg2pgt7r_jMJ4BVVBATNXy1g_OKZDBKKwryAevaJE1O6NekbKg0F7YZL0K/pub?output=csv';

let menuData = [];
let currentLang = 'fr'; // اللغة الافتراضية

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
    } catch (err) { console.error("Error:", err); }
}

function setLanguage(lang) {
    currentLang = lang;
    renderMain();
}

function renderMain() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="flex justify-center gap-2 mb-4">
            <button onclick="setLanguage('ar')" class="px-3 py-1 bg-gray-200 rounded">AR</button>
            <button onclick="setLanguage('fr')" class="px-3 py-1 bg-gray-200 rounded">FR</button>
            <button onclick="setLanguage('en')" class="px-3 py-1 bg-gray-200 rounded">EN</button>
        </div>
        <div id="welcome-screen" class="text-center p-6">
            <h1 class="text-2xl font-bold mb-4">${currentLang === 'ar' ? 'مرحباً بكم' : 'Bienvenue'}</h1>
            <button onclick="showCategories()" class="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">Menu</button>
        </div>
    `;
    document.getElementById('backBtn').classList.add('hidden');
}

function showCategories() {
    const cats = [...new Set(menuData.map(i => i[`cat_${currentLang}`] || i.cat_fr))];
    const content = document.getElementById('content');
    content.innerHTML = cats.map(c => `<div class="card" onclick="renderSub('${c}')"><span class="font-bold text-lg">${c}</span></div>`).join('');
    document.getElementById('backBtn').classList.remove('hidden');
    document.getElementById('backBtn').onclick = renderMain;
}

function renderSub(catName) {
    const items = menuData.filter(i => (i[`cat_${currentLang}`] || i.cat_fr) === catName);
    const subs = [...new Set(items.map(i => i.sub).filter(s => s && s !== '-'))];
    
    if (subs.length === 0) { renderItems(catName, ""); return; }
    
    const content = document.getElementById('content');
    content.innerHTML = subs.map(s => `<div class="card" onclick="renderItems('${catName}', '${s}')"><span class="font-bold text-lg">${s}</span></div>`).join('');
    document.getElementById('backBtn').onclick = showCategories;
}

function renderItems(catName, sub) {
    const items = menuData.filter(i => (i[`cat_${currentLang}`] || i.cat_fr) === catName && (i.sub === sub || !i.sub));
    const content = document.getElementById('content');
    content.innerHTML = items.map(i => `
        <div class="card">
            <span class="font-bold">${i[`name_${currentLang}`] || i.name_fr}</span>
            <span class="text-green-600 font-bold">${i.price} MAD</span>
        </div>
    `).join('');
    document.getElementById('backBtn').onclick = () => renderSub(catName);
}

init();
