// ... [نفس كود CSV_URL السابق] ...

function renderMain() {
    const cats = [...new Set(menuData.map(i => i.cat_fr).filter(c => c))];
    const content = document.getElementById('content');
    
    // إضافة صفحة ترحيبية إذا كانت أول مرة
    if (!document.getElementById('welcome-screen')) {
        content.innerHTML = `
            <div id="welcome-screen" class="text-center p-6">
                <img src="رابط_صورة_المطعم" class="w-full h-64 object-cover rounded-xl mb-4">
                <h1 class="text-2xl font-bold mb-4">مرحباً بكم في مقهانا</h1>
                <button onclick="showCategories()" class="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">عرض القائمة</button>
            </div>
        `;
    }
}

function showCategories() {
    const cats = [...new Set(menuData.map(i => i.cat_fr).filter(c => c))];
    const content = document.getElementById('content');
    content.innerHTML = cats.map(c => `
        <div class="card" onclick="renderSub('${c}')">
            <span class="font-bold text-lg">${c}</span>
        </div>`).join('');
    document.getElementById('backBtn').classList.add('hidden');
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
    
    // زر الرجوع يظهر دائماً في المستوى الثاني
    const backBtn = document.getElementById('backBtn');
    backBtn.classList.remove('hidden');
    backBtn.onclick = showCategories;
}

function renderItems(cat, sub) {
    const items = menuData.filter(i => i.cat_fr === cat && (i.sub === sub || (!i.sub && sub === 'undefined')));
    const content = document.getElementById('content');
    content.innerHTML = items.map(i => `
        <div class="card">
            <span class="font-bold">${i.name_fr}</span>
            <span class="text-green-600 font-bold">${i.price} MAD</span>
        </div>
    `).join('');
    
    // زر الرجوع يعيدنا للمستوى السابق
    const backBtn = document.getElementById('backBtn');
    backBtn.onclick = () => renderSub(cat);
}
