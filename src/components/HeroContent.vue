<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import ConsultModal from './ConsultModal.vue'
import SpotlightButton from './SpotlightButton.vue';

const { t } = useI18n()
const isModalOpen = ref(false)
const heroRef = ref(null)

onMounted(() => {
    gsap.fromTo(heroRef.value.children, 
        { y: 50, opacity: 0, rotateX: -15, transformPerspective: 800 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
    )
})

// ✅ реактивно обновляется при смене языка
const features = computed(() => [
    t('hero.f1'),
    t('hero.f2'),
    t('hero.f3')
])
</script>

<template>
    <div ref="heroRef" class="lg:w-1/2 text-center lg:text-left">
        <p class="mb-10 text-lg text-gray-700 dark:text-gray-300">
            {{ t('hero.subtitle') }}
        </p>

        <h1 class="mb-8 text-5xl font-bold text-gray-900 dark:text-white">
            {{ t('hero.title') }}
        </h1>

        <ul class="mb-12 space-y-6">
            <li v-for="(item, i) in features" :key="i" class="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <span class="mt-[2px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary">
                    <i class="fa-solid fa-check text-[12px] text-white"></i>
                </span>
                <p class="text-[16px] leading-6">
                    {{ item }}
                </p>
            </li>
        </ul>

        <div class="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <SpotlightButton @click="isModalOpen = true"
                class="h-14 rounded-2xl  px-10 text-base font-bold text-white shadow-lg transition ">
                {{ t('hero.button') }}
            </SpotlightButton>

            <a href="tel:+998901605156"
                class="h-14 rounded-2xl border border-gray-300 dark:border-gray-600 bg-transparent px-10 grid place-items-center text-[18px] font-bold text-black dark:text-white shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                +998 90 160-51-56
            </a>
        </div>

        <ConsultModal :isOpen="isModalOpen" @close="isModalOpen = false" />
    </div>
</template>