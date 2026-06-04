function resetGlobalBackground() {
    const appWrapper = document.getElementById('app') || document.body;
    appWrapper.style.backgroundImage = '';
}

// 1. رسم الواجهة الترحيبية الرئيسية
function renderMain() {
    resetGlobalBackground();
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

// 2. عرض الأقسام الرئيسية بخلفية مصورة كاملة وتعتيم ذكي
function showCategories() {
    resetGlobalBackground();
    const content = document.getElementById('content');
    if (!content) return;

    const cats = [...new Set(menuData.map(i => i[`cat_${currentLang}`]).filter(Boolean))];
    
    content.innerHTML = cats.map(c => {
        const catItems = menuData.filter(i => i[`cat_${currentLang}`] === c);
        const bgImage = catItems.find(i => i.image)?.image || '';
        
        return `
            <div class="relative overflow-hidden w-full h-24 rounded-xl shadow-md border border-white/10 transition-all hover:scale-[1.01] cursor-pointer flex items-center p-4 bg-gray-300 bg-cover bg-center" 
                 style="background-image: url('${bgImage}');"
                 onclick="renderSub('${c.replace(/'/g, "\\'")}')">
                <div class="absolute inset-0 bg-black/45 z-0"></div>
                <div class="relative z-10 w-full flex justify-between items-center text-white">
                    <span class="font-bold text-xl drop-shadow-md">${c}</span>
                    <span class="text-sm drop-shadow-md">${currentLang === 'ar' ? '⬅️' : '➡️'}</span>
                </div>
            </div>
        `;
    }).join('');
    
    updateBackButton(renderMain);
}

// 3. عرض الأقسام الفرعية بخلفية مصورة تابعة لها
function renderSub(catName) {
    resetGlobalBackground();
    const content = document.getElementById('content');
    if (!content) return;

    const items = menuData.filter(i => i[`cat_${currentLang}`] === catName);
    const subs = [...new Set(items.map(i => i[`sub_${currentLang}`]).filter(s => s && s !== '-'))];
    
    if (subs.length === 0) {
        renderItems(catName, "", false);
        return;
    }
    
    content.innerHTML = subs.map(s => {
        const subItems = items.filter(i => i[`sub_${currentLang}`] === s);
        const bgImage = subItems.find(i => i.image)?.image || '';

        return `
            <div class="relative overflow-hidden w-full h-24 rounded-xl shadow-md border border-white/10 transition-all hover:scale-[1.01] cursor-pointer flex items-center p-4 bg-gray-300 bg-cover bg-center" 
                 style="background-image: url('${bgImage}');"
                 onclick="renderItems('${catName.replace(/'/g, "\\'")}', '${s.replace(/'/g, "\\'")}', true)">
                <div class="absolute inset-0 bg-black/45 z-0"></div>
                <div class="relative z-10 w-full flex justify-between items-center text-white">
                    <span class="font-bold text-xl drop-shadow-md">${s}</span>
                    <span class="text-sm drop-shadow-md">${currentLang === 'ar' ? '⬅️' : '➡️'}</span>
                </div>
            </div>
        `;
    }).join('');
    
    updateBackButton(showCategories);
}

// 4. الميزة الثورية الجديدة: عرض المنتجات داخل كرت زجاجي موحد مصلح ومحمي ضد الأسطر الفارغة
function renderItems(catName, subName, hasParentSub) {
    const content = document.getElementById('content');
    if (!content) return;

    // إصلاح ذكي: تصفية صارمة تضمن أن السطر يحتوي على اسم منتج حقيقي لتجنب ظهور أي عملات طائرة عشوائية
    const items = menuData.filter(i => 
        i[`cat_${currentLang}`] === catName && 
        (subName === "" ? (!i[`sub_${currentLang}`] || i[`sub_${currentLang}`] === '-') : i[`sub_${currentLang}`] === subName) &&
        i[`name_${currentLang}`] && i[`name_${currentLang}`].trim() !== ""
    );
    
    // ميزة: جلب الصورة الموحدة لهذا القسم من الجدول وجعلها خلفية حية لكامل الشاشة فوراً
    const bgImage = items.find(i => i.image)?.image || '';
    const appWrapper = document.getElementById('app') || document.body;
    if (bgImage) {
        appWrapper.style.backgroundImage = `url('${bgImage}')`;
        appWrapper.style.backgroundSize = 'cover';
        appWrapper.style.backgroundPosition = 'center';
        appWrapper.style.backgroundAttachment = 'fixed';
    }

    // تحديد عنوان الصفحة (الفرعي إن وجد، وإلا الرئيسي)
    const title = subName !== "" ? subName : catName;
    
    content.innerHTML = `
        <div class="text-center mb-4">
            <h2 class="text-xl font-black text-gray-800 drop-shadow-sm bg-white/60 inline-block px-6 py-1.5 rounded-full backdrop-blur-md border border-white/30">${title}</h2>
        </div>
        
        <div class="unified-glass-card">
            ${items.map(i => `
                <div class="menu-item-row">
                    <span class="menu-item-name">${i[`name_${currentLang}`]}</span>
                    
                    <div class="menu-item-dots"></div>
                    
                    <span class="menu-item-price">
                        ${i.price} <span class="menu-item-currency">MAD</span>
                    </span>
                </div>
            `).join('')}
        </div>
    `;

    updateBackButton(hasParentSub ? () => renderSub(catName) : showCategories);
}
