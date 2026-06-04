const sanitizeHTML = (str) => {
    if (!str) return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str; 
    return tempDiv.innerHTML;
};

function toggleLogo(show) {
    const logo = document.getElementById('mainLogo');
    if (!logo) return;
    if (show) logo.classList.remove('hidden');
    else logo.classList.add('hidden');
}

function resetGlobalBackground() {
    const appWrapper = document.getElementById('app') || document.body;
    appWrapper.style.backgroundImage = '';
}

// 1. رسم الواجهة الترحيبية
function renderMain() {
    resetGlobalBackground();
    toggleLogo(true);
    
    // تسجيل الحالة
    if (history.state?.view !== 'main') {
        history.pushState({ view: 'main' }, '', '');
    }
    
    const content = document.getElementById('content');
    if (!content) return;

    const texts = { 
        ar: { t: 'مرحباً بكم في مقهانا', b: 'عرض القائمة' }, 
        fr: { t: 'Bienvenue chez nous', b: 'Voir le Menu' }, 
        en: { t: 'Welcome to our Cafe', b: 'View Menu' } 
    };
    
    content.innerHTML = `
        <div class="text-center p-6 space-y-6">
            <h1 class="text-3xl font-bold text-brand-dark">${sanitizeHTML(texts[currentLang].t)}</h1>
            <button onclick="showCategories()" class="bg-brand text-white px-12 py-4 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition-all">
                ${sanitizeHTML(texts[currentLang].b)}
            </button>
        </div>
    `;
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.classList.add('hidden');
}

// 2. عرض الأقسام
function showCategories() {
    resetGlobalBackground();
    toggleLogo(false);
    
    const content = document.getElementById('content');
    if (!content) return;

    // تسجيل الحالة
    if (history.state?.view !== 'cats') {
        history.pushState({ view: 'cats' }, '', '');
    }

    const cats = [...new Set(menuData.map(i => i[`cat_${currentLang}`]).filter(Boolean))];
    
    content.innerHTML = cats.map(c => {
        const catItems = menuData.filter(i => i[`cat_${currentLang}`] === c);
        const bgImage = sanitizeHTML(catItems.find(i => i.image)?.image || '');
        const safeC = sanitizeHTML(c);
        
        return `
            <div class="relative overflow-hidden w-full h-24 rounded-xl shadow-md border border-white/10 transition-all hover:scale-[1.01] cursor-pointer flex items-center p-4 bg-brand-light bg-cover bg-center" 
                 style="background-image: url('${bgImage}');"
                 onclick="renderSub('${safeC.replace(/'/g, "\\'")}')">
                <div class="absolute inset-0 bg-black/45 z-0"></div>
                <div class="relative z-10 w-full flex justify-between items-center text-white">
                    <span class="font-bold text-xl drop-shadow-md">${safeC}</span>
                    <span class="text-sm drop-shadow-md">${currentLang === 'ar' ? '⬅️' : '➡️'}</span>
                </div>
            </div>
        `;
    }).join('');
    
    updateBackButton();
}

// 3. عرض الأقسام الفرعية
function renderSub(catName) {
    resetGlobalBackground();
    toggleLogo(false);

    const content = document.getElementById('content');
    if (!content) return;

    // تسجيل الحالة
    if (history.state?.view !== 'sub' || history.state?.cat !== catName) {
        history.pushState({ view: 'sub', cat: catName }, '', '');
    }

    const items = menuData.filter(i => i[`cat_${currentLang}`] === catName);
    const subs = [...new Set(items.map(i => i[`sub_${currentLang}`]).filter(s => s && s !== '-'))];
    
    if (subs.length === 0) {
        renderItems(catName, "", true);
        return;
    }
    
    content.innerHTML = subs.map(s => {
        const subItems = items.filter(i => i[`sub_${currentLang}`] === s);
        const bgImage = sanitizeHTML(subItems.find(i => i.image)?.image || '');
        const safeS = sanitizeHTML(s);
        const safeCatName = sanitizeHTML(catName);

        return `
            <div class="relative overflow-hidden w-full h-24 rounded-xl shadow-md border border-white/10 transition-all hover:scale-[1.01] cursor-pointer flex items-center p-4 bg-brand-light bg-cover bg-center" 
                 style="background-image: url('${bgImage}');"
                 onclick="renderItems('${safeCatName.replace(/'/g, "\\'")}', '${safeS.replace(/'/g, "\\'")}', true)">
                <div class="absolute inset-0 bg-black/45 z-0"></div>
                <div class="relative z-10 w-full flex justify-between items-center text-white">
                    <span class="font-bold text-xl drop-shadow-md">${safeS}</span>
                    <span class="text-sm drop-shadow-md">${currentLang === 'ar' ? '⬅️' : '➡️'}</span>
                </div>
            </div>
        `;
    }).join('');
    
    updateBackButton();
}

// 4. عرض المنتجات
function renderItems(catName, subName, hasParentSub) {
    toggleLogo(false);
    
    const content = document.getElementById('content');
    if (!content) return;

    // تسجيل الحالة (سواء كان قادماً من Sub أو مباشرة من Cats)
    if (history.state?.view !== 'items' || history.state?.cat !== catName || history.state?.sub !== subName) {
        history.pushState({ view: 'items', cat: catName, sub: subName }, '', '');
    }

    const items = menuData.filter(i => 
        i[`cat_${currentLang}`] === catName && 
        (subName === "" ? (!i[`sub_${currentLang}`] || i[`sub_${currentLang}`] === '-') : i[`sub_${currentLang}`] === subName) &&
        i[`name_${currentLang}`] && i[`name_${currentLang}`].trim() !== ""
    );
    
    content.innerHTML = items.map(i => {
        const safeImg = sanitizeHTML(i.image);
        const safeName = sanitizeHTML(i[`name_${currentLang}`]);
        const safePrice = sanitizeHTML(i.price);

        const imgTag = safeImg.trim() !== "" ? `<img src="${safeImg}" loading="lazy" class="item-img-fixed rounded-xl flex-shrink-0" alt="${safeName}">` : '';

        return `
            <div class="item-card-fixed bg-white border border-gray-100 shadow-sm rounded-2xl px-4 flex items-center justify-between mb-3 transition-all hover:border-brand/30">
                <div class="flex items-center gap-3 h-full">
                    ${imgTag}
                    <span class="font-bold text-brand-dark text-lg flex items-center h-full">${safeName}</span>
                </div>
                <span class="text-brand font-black text-xl whitespace-nowrap flex items-center gap-1 h-full">
                    ${safePrice}<span class="text-[11px] font-normal text-brand-dark/60 tracking-wide">MAD</span>
                </span>
            </div>
        `;
    }).join('');

    updateBackButton();
}
/* =========================================
   ميزات البحث الذكي
   ========================================= */

function toggleSearch() {
    const container = document.getElementById('searchContainer');
    const input = document.getElementById('searchInput');
    
    container.classList.toggle('hidden');
    
    if (!container.classList.contains('hidden')) {
        input.focus();
    } else {
        input.value = ''; 
        if (document.getElementById('searchIndicator')) {
            showCategories(); 
        }
    }
}

function performSearch(query) {
    const q = query.trim();
    if (!q) {
        showCategories();
        return;
    }

    const options = {
        includeScore: true,
        threshold: 0.4, 
        keys: ['name_ar', 'name_fr', 'name_en', 'cat_ar', 'cat_fr']
    };

    const fuse = new Fuse(menuData, options);
    let results = fuse.search(q).map(res => res.item);
    let isFallback = false;

    if (results.length === 0) {
        const smartDictionary = {
            'بانيني': ['طاكوس', 'شاورما', 'ساندويتش', 'tacos', 'sandwich'],
            'panini': ['tacos', 'sandwich', 'chawarma'],
            'ليمون': ['عصير', 'برتقال', 'موهيتو', 'jus', 'مشروب'],
            'citron': ['jus', 'orange', 'mojito'],
            'عصير': ['jus', 'موهيتو', 'ليمون'],
            'قهوة': ['كابتشينو', 'اسبريسو', 'cafe', 'coffee', 'latte']
        };

        let fallbackKeywords = [];
        const qLower = q.toLowerCase();
        for (const key in smartDictionary) {
            if (qLower.includes(key) || key.includes(qLower)) {
                fallbackKeywords = fallbackKeywords.concat(smartDictionary[key]);
            }
        }

        if (fallbackKeywords.length > 0) {
            isFallback = true;
            let fallbackResults = [];
            fallbackKeywords.forEach(kw => {
                const kwResults = fuse.search(kw).map(res => res.item);
                fallbackResults = fallbackResults.concat(kwResults);
            });
            results = [...new Set(fallbackResults)];
        }
    }

    renderSearchResults(results, isFallback, sanitizeHTML(q));
}

function renderSearchResults(items, isFallback, safeQuery) {
    resetGlobalBackground();
    toggleLogo(false); 
    
    const content = document.getElementById('content');
    if (!content) return;

    let html = '';
    const messages = {
        ar: isFallback ? `لم نعثر على "<b>${safeQuery}</b>"، لكن هذه الخيارات قد تعجبك:` : `نتائج البحث عن "<b>${safeQuery}</b>":`,
        fr: isFallback ? `Nous n'avons pas trouvé "<b>${safeQuery}</b>", mais voici des alternatives :` : `Résultats pour "<b>${safeQuery}</b>":`,
        en: isFallback ? `We didn't find "<b>${safeQuery}</b>", but you might like these:` : `Search results for "<b>${safeQuery}</b>":`
    };

    if (items.length === 0) {
        html = `<div id="searchIndicator" class="text-center text-brand-dark mt-12 p-4 bg-brand-light rounded-xl border border-brand/20">
                    <p class="font-medium">${currentLang === 'ar' ? 'عذراً، لم نجد أي أطباق مطابقة لبحثك.' : 'Désolé, aucun plat ne correspond à votre recherche.'}</p>
                </div>`;
    } else {
        html = `<div id="searchIndicator" class="mb-4 text-sm ${isFallback ? 'text-brand-dark bg-brand-light border-brand/30' : 'text-brand bg-brand-light/50 border-brand/20'} p-3 rounded-lg border">
                    ${messages[currentLang]}
                </div>`;
        html += items.map(i => {
            const safeImg = sanitizeHTML(i.image);
            const safeName = sanitizeHTML(i[`name_${currentLang}`]);
            const safePrice = sanitizeHTML(i.price);
            const imgTag = safeImg.trim() !== "" ? `<img src="${safeImg}" loading="lazy" class="item-img-fixed rounded-xl flex-shrink-0" alt="${safeName}">` : '';

            return `
                <div class="item-card-fixed bg-white border border-gray-100 shadow-sm rounded-2xl px-4 flex items-center justify-between mb-3 transition-all hover:border-brand/30">
                    <div class="flex items-center gap-3 h-full">
                        ${imgTag}
                        <span class="font-bold text-brand-dark text-lg flex items-center h-full">${safeName}</span>
                    </div>
                    <span class="text-brand font-black text-xl whitespace-nowrap flex items-center gap-1 h-full">
                        ${safePrice}<span class="text-[11px] font-normal text-brand-dark/60 tracking-wide">MAD</span>
                    </span>
                </div>
            `;
        }).join('');
    }

    content.innerHTML = html;
    
    updateBackButton();
}
