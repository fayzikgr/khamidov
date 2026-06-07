<script setup>
import { ref, onMounted } from 'vue';

const password = ref('');
const isAuthenticated = ref(false);
const error = ref('');
const success = ref('');
const activeTab = ref('theme');

// Theme Settings
const primaryColor = ref('#008d80');
const primaryColorEnd = ref('#00bfa6');
const gradientDirection = ref('to right');
const glowIntensity = ref('medium');
const borderRadius = ref('14px');
const chatbotWelcome = ref('Salom! Men yuridik yordamchiman. Savolingizni yozing...');

// Contacts
const phone = ref('');
const address = ref('');
const telegram = ref('');
const instagram = ref('');

// Texts
const heroTitleUz = ref('');
const heroTitleRu = ref('');
const heroSubtitleUz = ref('');
const heroSubtitleRu = ref('');

// API Keys
const telegramBotToken = ref('');
const telegramChatId = ref('');
const openaiApiKey = ref('');

// Feedbacks
const feedbacks = ref([]);
const pendingFeedbacks = ref([]);

const addFeedback = () => {
    feedbacks.value.push({ name: '', text: '', avatar: '' });
};

const removeFeedback = (idx) => {
    feedbacks.value.splice(idx, 1);
};

const approveReview = (idx) => {
    const review = pendingFeedbacks.value[idx];
    feedbacks.value.unshift({
        name: review.name,
        text: review.text,
        avatar: ''
    });
    pendingFeedbacks.value.splice(idx, 1);
    saveSettings();
};

const rejectReview = (idx) => {
    if (confirm("Ushbu sharhni rad etishga ishonchingiz komilmi?")) {
        pendingFeedbacks.value.splice(idx, 1);
        saveSettings();
    }
};

// Fetch current settings
const loadSettings = async () => {
    try {
        const res = await fetch('/api/settings');
        if (res.ok) {
            const data = await res.json();
            primaryColor.value = data.primaryColor || '#008d80';
            primaryColorEnd.value = data.primaryColorEnd || '#00bfa6';
            gradientDirection.value = data.gradientDirection || 'to right';
            glowIntensity.value = data.glowIntensity || 'medium';
            borderRadius.value = data.borderRadius || '14px';
            chatbotWelcome.value = data.chatbotWelcome || 'Salom! Men yuridik yordamchiman. Savolingizni yozing...';
            
            if (data.contactInfo) {
                phone.value = data.contactInfo.phone || '';
                address.value = data.contactInfo.address || '';
                telegram.value = data.contactInfo.telegram || '';
                instagram.value = data.contactInfo.instagram || '';
            }

            heroTitleUz.value = data.texts?.uz?.hero?.title || '';
            heroTitleRu.value = data.texts?.ru?.hero?.title || '';
            heroSubtitleUz.value = data.texts?.uz?.hero?.subtitle || '';
            heroSubtitleRu.value = data.texts?.ru?.hero?.subtitle || '';
            
            telegramBotToken.value = data.telegramBotToken || '';
            telegramChatId.value = data.telegramChatId || '';
            openaiApiKey.value = data.openaiApiKey || '';

            feedbacks.value = data.feedbacks || [];
            pendingFeedbacks.value = data.pendingFeedbacks || [];
        }
    } catch (e) {
        alert('Sozlamalarni yuklashda xatolik');
    }
};

const login = () => {
    if (password.value === 'admin123') {
        isAuthenticated.value = true;
        error.value = '';
        loadSettings();
    } else {
        error.value = "Noto'g'ri parol";
    }
};

const saveSettings = async () => {
    success.value = '';
    error.value = '';
    
    const settings = {
        primaryColor: primaryColor.value,
        primaryColorEnd: primaryColorEnd.value,
        gradientDirection: gradientDirection.value,
        glowIntensity: glowIntensity.value,
        borderRadius: borderRadius.value,
        chatbotWelcome: chatbotWelcome.value,
        contactInfo: {
            phone: phone.value,
            address: address.value,
            telegram: telegram.value,
            instagram: instagram.value
        },
        texts: {
            uz: {
                hero: {
                    ...(heroTitleUz.value && { title: heroTitleUz.value }),
                    ...(heroSubtitleUz.value && { subtitle: heroSubtitleUz.value })
                }
            },
            ru: {
                hero: {
                    ...(heroTitleRu.value && { title: heroTitleRu.value }),
                    ...(heroSubtitleRu.value && { subtitle: heroSubtitleRu.value })
                }
            }
        },
        telegramBotToken: telegramBotToken.value,
        telegramChatId: telegramChatId.value,
        openaiApiKey: openaiApiKey.value,
        feedbacks: feedbacks.value,
        pendingFeedbacks: pendingFeedbacks.value
    };

    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password.value, settings })
        });
        
        if (res.ok) {
            success.value = 'Sozlamalar saqlandi! Sahifani yangilang.';
            // Update current page CSS var instantly
            document.documentElement.style.setProperty('--color-primary', primaryColor.value);
            document.documentElement.style.setProperty('--color-primary-end', primaryColorEnd.value);
            document.documentElement.style.setProperty('--gradient-dir', gradientDirection.value);
            document.documentElement.style.setProperty('--radius-btn', borderRadius.value);
            const opacityMap = { low: '0.2', medium: '0.5', high: '0.8' };
            document.documentElement.style.setProperty('--glow-opacity', opacityMap[glowIntensity.value] || '0.5');
        } else {
            error.value = 'Saqlashda xatolik';
        }
    } catch (e) {
        error.value = 'Server xatosi';
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50 pt-24 pb-20">
        
        <!-- LOGIN -->
        <div v-if="!isAuthenticated" class="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <h2 class="text-3xl font-bold mb-6 text-gray-800 text-center">Boshqaruv paneli (Admin)</h2>
            <div class="space-y-4">
                <input v-model="password" type="password" placeholder="Parol" @keyup.enter="login"
                    class="w-full border border-gray-300 bg-white text-gray-900 rounded-2xl p-4 outline-none focus:border-primary transition" />
                <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
                <button @click="login"
                    class="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition">
                    Kirish
                </button>
            </div>
        </div>

        <!-- DASHBOARD -->
        <div v-else class="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[750px] border border-gray-200">
            
            <!-- SIDEBAR -->
            <div class="w-full md:w-80 bg-gray-100 p-6 flex flex-col border-r border-gray-200 shrink-0">
                <h2 class="text-2xl font-bold mb-8 text-gray-900 px-2">khamidov.uz</h2>
                
                <nav class="flex-1 space-y-2 overflow-y-auto mb-6">
                    <button @click="activeTab = 'theme'" :class="activeTab === 'theme' ? 'bg-white shadow text-primary font-bold' : 'text-gray-600 hover:bg-gray-200 font-medium'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left">
                        🎨 Dizayn va Ranglar
                    </button>
                    <button @click="activeTab = 'content'" :class="activeTab === 'content' ? 'bg-white shadow text-primary font-bold' : 'text-gray-600 hover:bg-gray-200 font-medium'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left">
                        📝 Matnlar va Kontaktlar
                    </button>
                    <button @click="activeTab = 'api'" :class="activeTab === 'api' ? 'bg-white shadow text-primary font-bold' : 'text-gray-600 hover:bg-gray-200 font-medium'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left">
                        🔑 Integratsiya va Bot
                    </button>
                    <button @click="activeTab = 'reviews'" :class="activeTab === 'reviews' ? 'bg-white shadow text-primary font-bold' : 'text-gray-600 hover:bg-gray-200 font-medium'" class="w-full flex flex-col items-start gap-1 px-4 py-3 rounded-xl transition text-left">
                        <div class="flex items-center gap-3">⭐ Sharhlar</div>
                        <span v-if="pendingFeedbacks.length > 0" class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-7">{{ pendingFeedbacks.length }} yangi</span>
                    </button>
                </nav>

                <div class="pt-6 border-t border-gray-200 shrink-0 mt-auto">
                    <p v-if="error" class="text-red-500 text-xs font-bold text-center mb-2">{{ error }}</p>
                    <p v-if="success" class="text-green-600 text-xs font-bold text-center mb-2">{{ success }}</p>
                    <SpotlightButton @click="saveSettings" class="w-full h-14 text-white rounded-2xl font-bold shadow-md hover:-translate-y-1 transition transform flex items-center justify-center">
                        💾 Barchasini saqlash
                    </SpotlightButton>
                </div>
            </div>

            <!-- MAIN CONTENT -->
            <div class="flex-1 p-6 md:p-10 overflow-y-auto bg-white relative">
                
                <!-- TAB: THEME -->
                <div v-if="activeTab === 'theme'" class="animate-fadeIn">
                    <div class="mb-8">
                        <h3 class="text-3xl font-bold text-gray-900">Dizayn va Ranglar</h3>
                        <p class="text-gray-500 mt-2">Ushbu qism saytning vizual ko'rinishiga javobgar: asosiy rang, yorqinlik effektlari va tugmalar burchagi.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Boshlang'ich rang</label>
                            <div class="flex items-center gap-4">
                                <input type="color" v-model="primaryColor" class="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                                <input type="text" v-model="primaryColor" class="border border-gray-300 rounded-xl p-2 w-32" />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Oxirgi rang</label>
                            <div class="flex items-center gap-4">
                                <input type="color" v-model="primaryColorEnd" class="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                                <input type="text" v-model="primaryColorEnd" class="border border-gray-300 rounded-xl p-2 w-32" />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Gradient yo'nalishi</label>
                            <select v-model="gradientDirection" class="w-full border border-gray-300 rounded-xl p-3 bg-white">
                                <option value="to right">Chapdan o'ngga</option>
                                <option value="to bottom">Yuqoridan pastga</option>
                                <option value="to bottom right">Diagonali</option>
                                <option value="circle at center">Radial</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Yorqinlik (Glow)</label>
                            <select v-model="glowIntensity" class="w-full border border-gray-300 rounded-xl p-3 bg-white">
                                <option value="low">Kuchsiz</option>
                                <option value="medium">O'rtacha</option>
                                <option value="high">Kuchli</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Tugmalar burchagi</label>
                            <select v-model="borderRadius" class="w-full border border-gray-300 rounded-xl p-3 bg-white">
                                <option value="8px">8px (Kichik)</option>
                                <option value="14px">14px (O'rtacha)</option>
                                <option value="999px">999px (Yumaloq)</option>
                            </select>
                        </div>
                        <div class="md:col-span-2 pt-4 flex justify-center">
                            <SpotlightButton class="h-14 px-10 text-white font-bold flex items-center justify-center">
                                Tugma ko'rinishi
                            </SpotlightButton>
                        </div>
                    </div>
                </div>

                <!-- TAB: CONTENT -->
                <div v-if="activeTab === 'content'" class="animate-fadeIn">
                    <div class="mb-8">
                        <h3 class="text-3xl font-bold text-gray-900">Matnlar va Kontaktlar</h3>
                        <p class="text-gray-500 mt-2">Bu qism saytning asosiy ma'lumotlari: telefon raqamlar, manzillar va bosh sarlavhalarga javobgar.</p>
                    </div>

                    <div class="space-y-8">
                        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 class="font-bold text-lg mb-4 text-gray-800">📞 Kontaktlar</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Telefon</label>
                                    <input v-model="phone" placeholder="+998 90 123 45 67" class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Manzil</label>
                                    <input v-model="address" placeholder="Toshkent shahar..." class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Telegram (Havola)</label>
                                    <input v-model="telegram" placeholder="https://t.me/username" class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Instagram (Havola)</label>
                                    <input v-model="instagram" placeholder="https://instagram.com/username" class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 class="font-bold text-lg mb-4 text-gray-800">📝 Asosiy ekran (Hero)</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label class="text-sm font-bold text-gray-700">Sarlavha (UZ)</label>
                                    <input v-model="heroTitleUz" class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-bold text-gray-700">Sarlavha (RU)</label>
                                    <input v-model="heroTitleRu" class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-bold text-gray-700">Quyi sarlavha (UZ)</label>
                                    <textarea v-model="heroSubtitleUz" class="w-full border border-gray-300 p-3 rounded-xl h-24"></textarea>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-bold text-gray-700">Quyi sarlavha (RU)</label>
                                    <textarea v-model="heroSubtitleRu" class="w-full border border-gray-300 p-3 rounded-xl h-24"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB: API -->
                <div v-if="activeTab === 'api'" class="animate-fadeIn">
                    <div class="mb-8">
                        <h3 class="text-3xl font-bold text-gray-900">Integratsiya va Bot</h3>
                        <p class="text-gray-500 mt-2">Bu qism sun'iy intellekt va Telegram buyurtmalarni sozlash uchun javobgar.</p>
                    </div>

                    <div class="space-y-8">
                        <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h4 class="font-bold text-lg mb-4 text-blue-900">🤖 Chatbot AI sozlamalari</h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">OpenAI API Key (SI ishlashi uchun majburiy)</label>
                                    <input v-model="openaiApiKey" type="password" placeholder="sk-..." class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Salomlashish xabari</label>
                                    <input v-model="chatbotWelcome" class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 class="font-bold text-lg mb-4 text-gray-800">✈️ Telegram sozlamalari (Arizalar uchun)</h4>
                            <div class="grid grid-cols-1 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Telegram Bot Token</label>
                                    <input v-model="telegramBotToken" type="password" placeholder="123456:ABC-DEF..." class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Telegram Chat ID</label>
                                    <input v-model="telegramChatId" placeholder="123456789" class="w-full border border-gray-300 p-3 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB: REVIEWS -->
                <div v-if="activeTab === 'reviews'" class="animate-fadeIn">
                    <div class="mb-8">
                        <h3 class="text-3xl font-bold text-gray-900">Sharhlarni boshqarish</h3>
                        <p class="text-gray-500 mt-2">Bu qism yangi sharhlarni tekshirish va mavjudlarini tahrirlash uchun javobgar.</p>
                    </div>

                    <div class="space-y-8">
                        <!-- Pending -->
                        <div v-if="pendingFeedbacks.length > 0" class="bg-orange-50 p-6 rounded-2xl border border-orange-200">
                            <h4 class="font-bold text-lg mb-4 text-orange-900 flex items-center gap-2">⏳ Tekshiruvda kutmoqda ({{ pendingFeedbacks.length }})</h4>
                            <div class="space-y-4">
                                <div v-for="(rv, idx) in pendingFeedbacks" :key="idx" class="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                                    <div class="flex flex-col md:flex-row justify-between gap-4">
                                        <div class="flex-1">
                                            <p class="font-bold text-gray-900">{{ rv.name }} <span class="text-gray-500 font-normal">({{ rv.phone }})</span></p>
                                            <p class="text-gray-700 mt-2 whitespace-pre-line">{{ rv.text }}</p>
                                            <p class="text-xs text-gray-400 mt-2">{{ new Date(rv.date).toLocaleString() }}</p>
                                        </div>
                                        <div class="flex flex-col gap-2 shrink-0 justify-center">
                                            <button @click="approveReview(idx)" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition">Tasdiqlash</button>
                                            <button @click="rejectReview(idx)" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold transition">Rad etish</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Active Feedbacks -->
                        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div class="flex justify-between items-center mb-6">
                                <h4 class="font-bold text-lg text-gray-800">✅ Chop etilgan sharhlar</h4>
                                <button @click="addFeedback" class="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition text-sm">
                                    + Qo'lda qo'shish
                                </button>
                            </div>
                            
                            <div class="space-y-4">
                                <div v-for="(fb, i) in feedbacks" :key="i" class="p-4 bg-white border border-gray-200 rounded-xl relative shadow-sm">
                                    <button @click="removeFeedback(i)" class="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition">✕</button>
                                    
                                    <div class="space-y-3 pr-10">
                                        <div>
                                            <label class="text-xs font-bold text-gray-500 uppercase">Mijoz ismi</label>
                                            <input v-model="fb.name" class="w-full border-b border-gray-200 bg-transparent py-1 outline-none focus:border-primary font-medium text-gray-900" />
                                        </div>
                                        <div>
                                            <label class="text-xs font-bold text-gray-500 uppercase">Sharh matni</label>
                                            <textarea v-model="fb.text" class="w-full border border-gray-200 bg-transparent p-2 outline-none focus:border-primary text-gray-700 rounded-lg h-20 resize-none mt-1"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <p v-if="feedbacks.length === 0" class="text-gray-500 text-center py-4">Faol sharhlar yo'q</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
