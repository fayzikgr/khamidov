<script setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const img = new URL(
    "../images/portrait-benjamin-franklin-vector-illustration-600nw-2464399497.webp",
    import.meta.url
).href

// Feedbacks
const dynamicFeedbacks = ref([]);

onMounted(async () => {
    try {
        const res = await fetch('/api/settings');
        if (res.ok) {
            const data = await res.json();
            if (data.feedbacks && data.feedbacks.length > 0) {
                dynamicFeedbacks.value = data.feedbacks;
            }
        }
    } catch (e) {
        console.error('Failed to fetch feedbacks');
    }
});

// ✅ карточки через computed (важно)
const cards = computed(() => {
    if (dynamicFeedbacks.value.length > 0) {
        return dynamicFeedbacks.value.map(fb => ({
            name: fb.name || 'Аноним',
            text: fb.text || '',
            avatar: fb.avatar || img
        }));
    }
    
    // Default fallback if no feedbacks exist yet
    return [
        {
            name: t('team.c1.name'),
            text: t('team.c1.role'),
            avatar: img
        },
        {
            name: t('team.c2.name'),
            text: t('team.c2.role'),
            avatar: img
        },
        {
            name: t('team.c3.name'),
            text: t('team.c3.role'),
            avatar: img
        }
    ];
})

const isReviewModalOpen = ref(false);
const newReviewName = ref('');
const newReviewPhone = ref('');
const newReviewText = ref('');
const isSubmittingReview = ref(false);

const submitReview = async () => {
    if (!newReviewName.value || !newReviewPhone.value || !newReviewText.value) {
        alert("Пожалуйста, заполните все поля / Iltimos, barcha maydonlarni to'ldiring");
        return;
    }

    isSubmittingReview.value = true;
    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newReviewName.value,
                phone: newReviewPhone.value,
                text: newReviewText.value
            })
        });

        if (res.ok) {
            alert("Ваш отзыв отправлен на модерацию / Sharhingiz moderatsiyaga yuborildi ✅");
            isReviewModalOpen.value = false;
            newReviewName.value = '';
            newReviewPhone.value = '';
            newReviewText.value = '';
        } else {
            alert("Ошибка сервера");
        }
    } catch (error) {
        alert("Ошибка подключения к серверу");
    } finally {
        isSubmittingReview.value = false;
    }
};

</script>

<template>
    <section class="bg-white py-12 sm:py-16 lg:py-24">
        <div class="mx-auto container px-4 sm:px-6">

            <!-- TITLE -->
            <h2 class="text-center font-medium text-4xl sm:text-4xl lg:text-[60px] leading-[1.1]">
                {{ t('team.title1') }}
            </h2>

            <div class="flex justify-center mt-6">
                <button @click="isReviewModalOpen = true" class="px-8 py-3 bg-gradient-to-r from-primary to-[var(--color-primary-end)] text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                    Оставить отзыв / Sharh yozish
                </button>
            </div>

            <!-- CARDS MARQUEE -->
            <div class="mt-10 py-12 overflow-hidden relative w-full mask-edges">
                <div class="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max px-4">
                    <article v-for="(c, i) in [...cards, ...cards, ...cards]" :key="i" class="w-[320px] sm:w-[380px] shrink-0 group relative overflow-hidden rounded-[22px] sm:rounded-[26px] bg-white
                 shadow-[0_18px_55px_rgba(0,0,0,0.16)]
                 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(0,0,0,0.18)]">

                    <div class="h-[82px] sm:h-[92px] bg-[#22262b]" />

                    <div class="px-5 sm:px-7 pb-6 sm:pb-7 pt-5 sm:pt-6 h-full flex flex-col">

                        <div class="flex items-center gap-3 sm:gap-4 mb-4">
                            <img :src="c.avatar"
                                class="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-white" />

                            <div class="min-w-0">
                                <div class="text-[16px] sm:text-[18px] font-extrabold text-[#111827] truncate">
                                    {{ c.name }}
                                </div>
                            </div>
                        </div>

                        <div class="mt-1 whitespace-pre-line text-[14px] sm:text-[15px] text-[#4b5563] italic flex-grow">
                            "{{ c.text }}"
                        </div>

                    </div>
                </article>

                </div>
            </div>
        </div>

        <!-- REVIEW MODAL -->
        <div v-if="isReviewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div @click="isReviewModalOpen = false" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            
            <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-10">
                <button @click="isReviewModalOpen = false" class="absolute top-5 right-5 text-gray-400 hover:text-black text-xl transition">✕</button>
                
                <h3 class="text-2xl font-bold mb-6 text-gray-800">Оставить отзыв</h3>
                
                <div class="space-y-4">
                    <input v-model="newReviewName" type="text" placeholder="Ваше имя / Ismingiz"
                        class="w-full border border-gray-300 rounded-2xl p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
                    
                    <input v-model="newReviewPhone" type="text" placeholder="+998 __ ___ __ __"
                        class="w-full border border-gray-300 rounded-2xl p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
                    
                    <textarea v-model="newReviewText" placeholder="Ваш отзыв / Sharhingizni yozing"
                        class="w-full h-32 border border-gray-300 rounded-2xl p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none"></textarea>
                    
                    <button @click="submitReview" :disabled="isSubmittingReview"
                        class="w-full h-14 bg-gradient-to-r from-primary to-[var(--color-primary-end)] hover:scale-[1.02] transition-transform text-white rounded-2xl font-bold shadow-lg">
                        {{ isSubmittingReview ? 'Отправка...' : 'Отправить / Yuborish' }}
                    </button>
                </div>
            </div>
        </div>

    </section>
</template>

<style scoped>
.mask-edges {
    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

@keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-100% / 3)); }
}

.animate-marquee {
    animation: marquee 35s linear infinite;
}
</style>