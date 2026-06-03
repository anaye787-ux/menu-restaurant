const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRj_giqJJMsxVWMvgKogUkg2pgt7r_jMJ4BVVBATNXy1g_OKZDBKKwryAevaJE1O6NekbKg0F7YZL0K/pub?output=csv';

let menuData = [];
let currentLang = 'fr';

// دالة جلب البيانات الأساسية للمشروع
async function init() {
    try {
        // إظهار تأثير الهيكل العظمي المتحرك (Skeleton Loader) أثناء التحميل
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = Array(4).fill(0).map(() => `
                <div class="skeleton-loader w-full h-24 rounded-xl shadow-sm border border-gray-200"></div>
            `).join('');
        }

        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const text = await res.text();
        const rows = text.split(/\r?\n/).slice(1).filter(row => row.trim() !== '');
        
        menuData = rows.map(row => {
            let cols = [];
            let insideQuote = false;
            let currentCell = '';

            for (let i = 0; i < row.length; i++) {
                let char = row[i];
                if (char === '"') {
                    insideQuote = !insideQuote;
                } else if (char === ',' && !insideQuote) {
                    cols.push(currentCell);
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }
            cols.push(currentCell);

            const clean = (val) => val ? val.trim().replace(/^"|"$/g, '').trim() : '';
            
            return {
                cat_ar:  clean(cols[0]),  // A: Category_AR
                cat_fr:  clean(cols[1]),  // B: Category_FR
                cat_en:  clean(cols[2]),  // C: Category_EN
                sub_ar:  clean(cols[3]),  // D: SubCategory_AR
                sub_fr:  clean(cols[4]),  // E: SubCategory_FR
                sub_en:  clean(cols[5]),  // F: SubCategory_EN
                name_ar: clean(cols[6]),  // G: Item_Name_AR
                name_fr: clean(cols[7]),  // H: Item_Name_FR
                name_en: clean(cols[8]),  // I: Item_Name_EN
                price:   clean(cols[9]),  // J: Price
                image:   clean(cols[10])  // K: ImageURL
            };
        }).filter(item => item.cat_fr || item.cat_ar);
        
        // الانتقال لرسم الواجهة الترحيبية بعد اكتمال جلب البيانات بنجاح
        renderMain();
    } catch (err) {
        console.error("Critical Error Initialization Failed:", err);
        document.getElementById('content').innerHTML = `<p class="text-red-500 text-center p-4">Service temporarily unavailable.</p>`;
    }
}
