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

// 2. عرض الأقسام الرئيسية بخلفية مصورة كاملة وتعتيم ذكي
function showCategories() {
    const content = document.getElementById('content');
    if (!content) return;

    const cats = [...new Set(menuData.map(i => i[`cat_${currentLang}`]).filter(Boolean))];
    
    content.innerHTML = cats.map(c => {
        // استخراج أول رابط صورة متاح لهذه الفئة الرئيسية من عمود ImageURL
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
    const content = document.getElementById('content');
    if (!content) return;

    const items = menuData.filter(i => i[`cat_${currentLang}`] === catName);
    const subs = [...new Set(items.map(i => i[`sub_${currentLang}`]).filter(s => s && s !== '-'))];
    
    // إذا كان القسم مباشراً ومثبتاً بدون فروع فرعية ننتقل للأصناف فوراً
    if (subs.length === 0) {
        renderItems(catName, "", false);
        return;
    }
    
    content.innerHTML = subs.map(s => {
        // استخراج أول رابط صورة متاح لهذا القسم الفرعي المحدد
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

// 4. عرض المنتجات الفردية بنمط النظافة والزجاج الشفاف (Glassmorphism) بدون صور تشتيتية
function renderItems(catName, subName, hasParentSub) {
    const content = document.getElementById('content');
    if (!content) return;

    const items = menuData.filter(i => 
        i[`cat_${currentLang}`] === catName && 
        (subName === "" ? (!i[`sub_${currentLang}`] || i[`sub_${currentLang}`] === '-') : i[`sub_${currentLang}`] === subName)
    );
    
    content.innerHTML = items.map(i => `
        <div class="card-glass-item flex justify-between items-center p-4 rounded-xl transition-all">
            <span class="font-bold text-gray-800 text-lg">${i[`name_${currentLang}`]}</span>
            <span class="text-green-700 font-extrabold px-3 py-1 bg-green-50 rounded-full text-md border border-green-100">${i.price} MAD</span>
        </div>
    `).join('');

    updateBackButton(hasParentSub ? () => renderSub(catName) : showCategories);
}
