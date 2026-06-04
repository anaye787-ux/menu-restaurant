/**
 * @file ui.js
 * @description ملف إدارة الواجهات المستقر - متضمن الفئات المخصصة للبطاقات + ميزة البحث الذكي والتحميل الكسول + ألوان الهوية (Brand)
 */

// دالة مساعدة لإعادة تنظيف خلفية الشاشة والعودة للخلفية الضبابية الافتراضية عند الرجوع
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
            <h1 class="text-3xl font-bold text-brand-dark">${texts[currentLang].t}</h1>
            <button onclick="showCategories()" class="bg-brand text-white px-12 py-4 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition-all">
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
            <div class="relative overflow-hidden w-full h-24 rounded-xl shadow-md border border-white/10 transition-all hover:scale-[1.01] cursor-pointer flex items-center p-4 bg-brand-light bg-cover bg-center" 
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
            <div class="relative overflow-hidden w-full h-24 rounded-xl shadow-md border border-white/10 transition-all hover:scale-[1.01] cursor-pointer flex items-center p-4 bg-brand-light bg-cover bg-center" 
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

// 4. عرض المنتجات الفردية بحجم بطاقات موحد عبر فئات CSS المخصصة
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
        // إضافة ميزة التحميل الكسول (loading="lazy") مع الاحتفاظ بالفئة item-img-fixed
        const imgTag = i.image && i.image.trim() !== "" 
            ? `<img src="${i.image}" loading="lazy" class="item-img-fixed rounded-xl flex-shrink-0" alt="${i[`name_${currentLang}`]}">` 
            : '';

        // استخدام الفئة item-card-fixed كما هي لضمان عدم انتفاخ البطاقة مع تأثير حواف بألوان الهوية
        return `
            <div class="item-card-fixed bg-white border border-gray-100 shadow-sm rounded-2xl px-4 flex items-center justify-between mb-3 transition-all hover:border-brand/30">
                
                <div class="flex items-center gap-3 h-full">
                    ${imgTag}
                    <span class="font-bold text-brand-dark text-lg flex items-center h-full">${i[`name_${currentLang}`]}</span>
                </div>
                
                <span class="text-brand font-black text-xl whitespace-nowrap flex items-center gap-1 h-full">
                    ${i.price}<span class="text-[11px] font-normal text-brand-dark/60 tracking-wide">MAD</span>
                </span>
                
            </div>
        `;
    }).join('');

    updateBackButton(hasParentSub ? () => renderSub(catName) : showCategories);
}

/* =========================================
   ميزات البحث الذكي (Smart Fallback Search)
   ========================================= */

function toggleSearch() {
    const container = document.getElementById('searchContainer');
    const input = document.getElementById('searchInput');
    
    container.classList.toggle('hidden');
    
    if (!container.classList.contains('hidden')) {
        input.focus();
    } else {
        input.value = ''; // تنظيف الحقل عند الإغلاق
        if (document.getElementById('searchIndicator')) {
            showCategories(); // العودة للأقسام إذا كنا في صفحة النتائج
        }
    }
}

function performSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        showCategories();
        return;
    }

    // 1. البحث المباشر في الأسماء
    let results = menuData.filter(i => 
        (i.name_ar && i.name_ar.toLowerCase().includes(q)) ||
        (i.name_fr && i.name_fr.toLowerCase().includes(q)) ||
        (i.name_en && i.name_en.toLowerCase().includes(q))
    );

    let isFallback = false;

    // 2. البحث الذكي (اقتراح بدائل) إذا كانت النتيجة 0
    if (results.length === 0) {
        // قاموس المرادفات
        const smartDictionary = {
            'بانيني': ['طاكوس', 'شاورما', 'ساندويتش', 'tacos', 'sandwich'],
            'panini': ['tacos', 'sandwich', 'chawarma'],
            'ليمون': ['عصير', 'برتقال', 'موهيتو', 'jus', 'مشروب'],
            'citron': ['jus', 'orange', 'mojito'],
            'عصير': ['jus', 'موهيتو', 'ليمون'],
            'قهوة': ['كابتشينو', 'اسبريسو', 'cafe', 'coffee', 'latte']
        };

        let fallbackKeywords = [];
        for (const key in smartDictionary) {
            if (q.includes(key) || key.includes(q)) {
                fallbackKeywords = fallbackKeywords.concat(smartDictionary[key]);
            }
        }

        if (fallbackKeywords.length > 0) {
            isFallback = true;
            results = menuData.filter(i => {
                return fallbackKeywords.some(kw => 
                    (i.name_ar && i.name_ar.toLowerCase().includes(kw)) ||
                    (i.name_fr && i.name_fr.toLowerCase().includes(kw)) ||
                    (i.cat_ar && i.cat_ar.toLowerCase().includes(kw)) ||
                    (i.cat_fr && i.cat_fr.toLowerCase().includes(kw))
                );
            });
        }
    }

    renderSearchResults(results, isFallback, q);
}

function renderSearchResults(items, isFallback, query) {
    resetGlobalBackground();
    const content = document.getElementById('content');
    if (!content) return;

    let html = '';
    
    // واجهة رسائل تفاعلية حسب اللغة ونوع النتيجة
    const messages = {
        ar: isFallback ? `لم نعثر على "<b>${query}</b>"، لكن هذه الخيارات قد تعجبك:` : `نتائج البحث عن "<b>${query}</b>":`,
        fr: isFallback ? `Nous n'avons pas trouvé "<b>${query}</b>", mais voici des alternatives :` : `Résultats pour "<b>${query}</b>":`,
        en: isFallback ? `We didn't find "<b>${query}</b>", but you might like these:` : `Search results for "<b>${query}</b>":`
    };

    const emptyMsg = {
        ar: 'عذراً، لم نجد أي أطباق مطابقة لبحثك.',
        fr: 'Désolé, aucun plat ne correspond à votre recherche.',
        en: 'Sorry, no items match your search.'
    };

    if (items.length === 0) {
        html = `<div id="searchIndicator" class="text-center text-brand-dark mt-12 p-4 bg-brand-light rounded-xl border border-brand/20">
                    <p class="font-medium">${emptyMsg[currentLang]}</p>
                </div>`;
    } else {
        html = `
            <div id="searchIndicator" class="mb-4 text-sm ${isFallback ? 'text-brand-dark bg-brand-light border-brand/30' : 'text-brand bg-brand-light/50 border-brand/20'} p-3 rounded-lg border">
                ${messages[currentLang]}
            </div>
        `;
        html += items.map(i => {
            const imgTag = i.image && i.image.trim() !== "" 
                ? `<img src="${i.image}" loading="lazy" class="item-img-fixed rounded-xl flex-shrink-0" alt="${i[`name_${currentLang}`]}">` 
                : '';

            return `
                <div class="item-card-fixed bg-white border border-gray-100 shadow-sm rounded-2xl px-4 flex items-center justify-between mb-3 transition-all hover:border-brand/30">
                    <div class="flex items-center gap-3 h-full">
                        ${imgTag}
                        <span class="font-bold text-brand-dark text-lg flex items-center h-full">${i[`name_${currentLang}`]}</span>
                    </div>
                    <span class="text-brand font-black text-xl whitespace-nowrap flex items-center gap-1 h-full">
                        ${i.price}<span class="text-[11px] font-normal text-brand-dark/60 tracking-wide">MAD</span>
                    </span>
                </div>
            `;
        }).join('');
    }

    content.innerHTML = html;
    
    // زر الرجوع يعود دائماً للأقسام ويفك التركيز عن البحث
    updateBackButton(() => {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchContainer').classList.add('hidden');
        showCategories();
    });
}
