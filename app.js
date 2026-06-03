const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRj_giqJJMsxVWMvgKogUkg2pgt7r_jMJ4BVVBATNXy1g_OKZDBKKwryAevaJE1O6NekbKg0F7YZL0K/pub?output=csv';

let menuData = [];

async function init() {
    try {
        const res = await fetch(CSV_URL);
        const text = await res.text();
        // تقسيم البيانات إلى أسطر وتجاهل السطر الأول (العناوين)
        menuData = text.split('\n').slice(1).map(row => {
            const cols = row.split(',');
            return {
                cat_fr: cols[1]?.trim(),
                sub: cols[2]?.trim(),
                name_fr: cols[5]?.trim(),
                price: cols[7]?.trim()
            };
        }).filter(item => item.cat_fr); // حذف الأسطر الفارغة
        renderMain();
    } catch (err) {
        console.error("خطأ في جلب البيانات: ", err);
    }
}

function renderMain() {
    const cats = [...new Set(menuData.map(i => i.cat_fr))];
    const content = document.getElementById('content');
    content.innerHTML = cats.map(c => `
        <div class="card" onclick="renderSub('${c}')">
            <span class="font-bold text-lg">${c}</span>
        </div>`).join('');
    document.getElementById('backBtn').classList.add('hidden');
}

function renderSub(cat) {
    // جلب التصنيفات الفرعية المرتبطة بالقسم
    const subs = [...new Set(menuData.filter(i => i.cat_fr === cat).map(i => i.sub))];
    
    // إذا كانت الخانة فارغة أو تساوي "-" نذهب للمنتجات مباشرة
    if (subs.length === 1 && (!subs[0] || subs[0] === '-')) {
        renderItems(cat, subs[0]);
        return;
    }
    
    const content = document.getElementById('content');
    content.innerHTML = subs.map(s => `
        <div class="card" onclick="renderItems('${cat}', '${s}')">
            <span class="font-bold text-lg">${s}</span>
        </div>`).join('');
    document.getElementById('backBtn').classList.remove('hidden');
    document.getElementById('backBtn').onclick = renderMain;
}

function renderItems(cat, sub) {
    const items = menuData.filter(i => i.cat_fr === cat && (i.sub === sub || (!i.sub && sub === 'undefined')));
    const content = document.getElementById('content');
    content.innerHTML = items.map(i => `
        <div class="card">
            <span class="font-bold">${i.name_fr}</span>
            <span class="text-green-600 font-bold">${i.price} MAD</span>
        </div>`).join('');
    document.getElementById('backBtn').onclick = () => renderSub(cat);
}

init();