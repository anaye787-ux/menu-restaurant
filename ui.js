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
    resetGlobalBackground();
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

// 4. عرض المنتجات الفردية بنمط البطاقات البيضاء المنفصلة وتنسيق التسعير الفاخر المطور (نسخة مصلحة الحجم بالكامل)
function renderItems(catName, subName, hasParentSub) {
    const content = document.getElementById('content');
    if (!content) return;

    // تصفية المنتجات مع تجاهل الأسطر المخصصة للصور فقط لتجنب أي أخطاء بصرية
    const items = menuData.filter(i => 
        i[`cat_${currentLang}`] === catName && 
        (subName === "" ? (!i[`sub_${currentLang}`] || i[`sub_${currentLang}`] === '-') : i[`sub_${currentLang}`] === subName) &&
        i[`name_${currentLang}`] && i[`name_${currentLang}`].trim() !== ""
    );
    
    content.innerHTML = items.map(i => {
        // ميزة الفرض الإجباري المصلحة: استبدال كلاس Tailwind بستايل مباشر مقفل ومقاوم للكاش
        const imgTag = i.image && i.image.trim() !== "" 
            ? `<img src="${i.image}" style="width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important;" class="object-cover rounded-lg flex-shrink-0" alt="">` 
            : '';

        return `
            <div class="bg-white border border-gray-100 shadow-sm rounded-2xl p-3 flex items-center justify-between mb-3 min-h-[64px] transition-all">
                
                <div class="flex items-center gap-3">
                    ${imgTag}
                    <span class="font-bold text-gray-800 text-lg flex items-center">${i[`name_${currentLang}`]}</span>
                </div>
                
                <span class="text-gray-900 font-black text-xl whitespace-nowrap pl-2 pr-2 flex items-center gap-1">
                    ${i.price}<span class="text-[11px] font-normal text-gray-400 tracking-wide">MAD</span>
                </span>
                
            </div>
        `;
    }).join('');

    updateBackButton(hasParentSub ? () => renderSub(catName) : showCategories);
}
