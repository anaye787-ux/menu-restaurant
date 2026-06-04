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
        
        // --- التحديث هنا: استخدام PapaParse بدلاً من المعالجة اليدوية ---
        const parsedData = Papa.parse(text, { skipEmptyLines: true });
        const rows = parsedData.data.slice(1); // تجاهل السطر الأول (العناوين)
        
        menuData = rows.map(cols => {
            // الدالة المساعدة لتنظيف البيانات (مأخوذة من كودك)
            const clean = (val) => val ? val.trim() : '';
            
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
        
        // نصوص رسالة الخطأ وزر المحاولة لتتناسب مع تعدد اللغات (مأخوذة من كودك دون تعديل)
        const errorUI = {
            ar: { msg: 'عذراً، حدث خطأ في الاتصال. يرجى التحقق من الشبكة.', btn: 'إعادة المحاولة 🔄' },
            fr: { msg: 'Erreur de connexion. Veuillez vérifier votre réseau.', btn: 'Réessayer 🔄' },
            en: { msg: 'Connection error. Please check your network.', btn: 'Retry 🔄' }
        };

        const lang = typeof currentLang !== 'undefined' ? currentLang : 'fr'; // تأمين لغة افتراضية

        const content = document.getElementById('content');
        if (content) {
            // رسم واجهة الخطأ مع زر إعادة المحاولة المرتبط بدالة init (مأخوذة من كودك دون تعديل)
            content.innerHTML = `
                <div class="flex flex-col items-center justify-center p-6 mt-12 text-center space-y-5 animate-[fadeIn_0.3s_ease-out]">
                    <div class="text-red-500 bg-red-50 p-4 rounded-full shadow-sm">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p class="text-gray-700 font-medium text-lg leading-relaxed">${errorUI[lang].msg}</p>
                    <button onclick="init()" class="bg-gray-900 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-800 active:scale-95 transition-all">
                        ${errorUI[lang].btn}
                    </button>
                </div>
            `;
        }
    }
}
