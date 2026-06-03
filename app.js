const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRj_giqJJMsxVWMvgKogUkg2pgt7r_jMJ4BVVBATNXy1g_OKZDBKKwryAevaJE1O6NekbKg0F7YZL0K/pub?output=csv';

let menuData = [];

async function init() {
    try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        menuData = text.split('\n').slice(1).map(row => {
            const cols = row.split(',');
            return {
                cat_fr: cols[1]?.trim(),
                sub: cols[2]?.trim(),
                name_fr: cols[5]?.trim(),
                price: cols[7]?.trim()
            };
        }).filter(item => item.cat_fr);
        renderMain();
    } catch (err) {
        console.error("خطأ في تحميل البيانات:", err);
    }
}

function renderMain() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div id="welcome-screen" class="text-center p-6">
            <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500" class="w-full h-64 object-cover rounded-xl mb-4">
            <h1 class="text-2xl font-bold mb-4">Bienvenue chez nous</h1>
            <button onclick="showCategories()" class="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">Voir le Menu</button>
        </div>
    `;
    document.getElementById('backBtn').classList.add('hidden');
}

function showCategories() {
    const cats = [...new Set(menuData.map(i => i.cat_fr).filter(c => c))];
    const content = document.getElementById('content');
    content.innerHTML = cats.map(c => `
        <div class="card" onclick="renderSub('${c}')">
            <span class="font-bold text-lg">${c}</span>
        </div>`).join('');
    
    const backBtn = document.getElementById('backBtn');
    backBtn.classList.remove('hidden');
    backBtn.innerHTML = '⬅ Accueil';
    backBtn.onclick = renderMain;
}

function renderSub(cat) {
    const subs = [...new Set(menuData.filter(i => i.cat_fr === cat).map(i => i.sub).filter(s => s && s !== '-'))];
    
    if (subs.length === 0) {
        renderItems(cat, ""); 
    } else {
        const content = document.getElementById('content');
        content.innerHTML = subs.map(s => `
            <div class="card" onclick="renderItems('${cat}', '${s}')">
                <span class="font-bold text-lg">${s}</span>
            </div>`).join('');
    }
    
    const backBtn = document.getElementById('backBtn');
    backBtn.classList.remove('hidden');
    backBtn.innerHTML = '⬅ Retour';
    backBtn.onclick = showCategories;
}

function renderItems(cat, sub) {
    const items = menuData.filter(i => i.cat_fr === cat && (i.sub === sub || (!i.sub && sub === '')));
    const content = document.getElementById('content');
    content.innerHTML = items.map(i => `
        <div class="card">
            <span class="font-bold">${i.name_fr}</span>
            <span class="text-green-600 font-bold">${i.price} MAD</span>
        </div>
    `).join('');
    
    const backBtn = document.getElementById('backBtn');
    backBtn.onclick = () => {
        const subs = [...new Set(menuData.filter(i => i.cat_fr === cat).map(i => i.sub).filter(s => s && s !== '-'))];
        if (subs.length === 0) showCategories();
        else renderSub(cat);
    };
}

init();
