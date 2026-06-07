<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SpotlightButton from './SpotlightButton.vue'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()
const { t } = useI18n()
const containerRef = ref(null)

onMounted(() => {
    gsap.fromTo(containerRef.value.children, 
        { y: 80, opacity: 0, scale: 0.9, rotationX: -15, transformPerspective: 1000 },
        { 
            y: 0, opacity: 1, scale: 1, rotationX: 0, 
            duration: 0.7, 
            stagger: 0.15, 
            ease: 'back.out(1.8)',
            scrollTrigger: {
                trigger: containerRef.value,
                start: "top 80%"
            }
        }
    )
})

// ✅ все данные через computed (реактивно)
const services = computed(() => [
    {
        title: t('services.s1.title'),
        desc: t('services.s1.desc'),
        price: '100$',
        oldPrice: '250$'
    },
    {
        title: t('services.s2.title'),
        desc: t('services.s2.desc'),
        button: t('services.s2.button')
    },
    {
        title: t('services.s3.title'),
        desc: t('services.s3.desc'),
        price: '500$+',
        oldPrice: '800$+'
    }
])
</script>

<template>
    <div class="px-4 mt-12 max-w-7xl mx-auto scroll-mt-[100px] transition-colors">

        <!-- Заголовок -->
        <h2 class="text-3xl md:text-6xl font-medium text-center mb-10 text-gray-900 dark:text-white">
            {{ t('services.title') }}
            <span class="text-primary">{{ t('services.highlight') }}</span>
        </h2>

        <div ref="containerRef" class="flex flex-col md:flex-row">

            <div v-for="(item, i) in services" :key="i"
                class="flex flex-col items-center text-center justify-center px-6 py-8 md:px-10 md:border-r border-gray-300 dark:border-gray-700 last:border-none">

                <h3 class="text-2xl md:text-3xl font-semibold mb-2 text-[#3c3c3c] dark:text-white">
                    {{ item.title }}
                </h3>

                <p class="text-gray-600 dark:text-gray-300 mb-4 max-w-sm">
                    {{ item.desc }}
                </p>

                <!-- если есть кнопка -->
                <template v-if="item.button">
                    <a href="/order" target="_blank">
                        <SpotlightButton
                            class="  text-white px-10 py-2 rounded-2xl mt-5 transition">
                            {{ item.button }}
                        </SpotlightButton>
                    </a>
                </template>

                <!-- если есть цена -->
                <template v-else>
                    <div class="bg-[#eaf4f3] dark:bg-gray-800 px-5 py-2 rounded-2xl mt-5 flex items-center justify-center gap-2 transition-colors">

                        <span class="text-xl md:text-2xl font-bold text-primary flex items-center">
                            <span class="text-xs mt-1 mr-1">
                                {{ t('services.from') }}
                            </span>
                            {{ item.price }}
                        </span>

                        <span class="line-through text-sm md:text-base text-gray-500 dark:text-gray-400">
                            {{ item.oldPrice }}
                        </span>

                    </div>
                </template>

            </div>

        </div>
    </div>
</template>