<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()
const aboutRef = ref(null)

onMounted(() => {
    gsap.fromTo(aboutRef.value.children, 
        { y: 80, opacity: 0, scale: 0.85, rotationY: 10, transformPerspective: 1000 },
        { 
            y: 0, opacity: 1, scale: 1, rotationY: 0, 
            duration: 0.8, 
            stagger: 0.15, 
            ease: 'back.out(1.5)',
            scrollTrigger: {
                trigger: aboutRef.value,
                start: "top 80%"
            }
        }
    )
})
</script>

<template>
    <section class="bg-[#f3f4f6] dark:bg-gray-800 py-20 transition-colors">
        <div ref="aboutRef" class="max-w-[1200px] mx-auto px-6">

            <!-- Заголовок -->
            <h2 class="text-center text-[42px] font-semibold text-gray-900 dark:text-white mb-16">
                {{ t('about.title') }}
            </h2>

            <!-- Карточка -->
            <div class="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-12 shadow-md hover:shadow-xl transition duration-300">

                <div class="grid md:grid-cols-[160px_1fr] gap-6 items-start">

                    <!-- Фото -->
                    <img src="../images/khamidov.jpg" class="w-40 h-40 object-cover rounded-2xl shadow-md">

                    <!-- Заголовок -->
                    <div>
                        <h3 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {{ t('about.name') }}
                        </h3>

                        <p class="text-primary font-semibold">
                            {{ t('about.exp') }}
                        </p>
                    </div>

                    <!-- Текст -->
                    <div class="md:col-span-2 mt-4">
                        <div class="md:col-span-2 mt-4">
                            <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-[16px] md:text-[17px]"
                                v-html="t('about.text')">
                            </p>
                        </div>
                    </div>

                    <!-- Карта -->
                    <div class="md:col-span-2 mt-10">
                        <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {{ t('about.location') }}
                        </h4>

                        <div class="w-full h-[350px] rounded-2xl overflow-hidden shadow-md">
                            <iframe src="https://www.google.com/maps?q=40.389611,71.801167&z=17&output=embed"
                                class="w-full h-full border-0" loading="lazy">
                            </iframe>
                        </div>

                        <p class="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                            {{ t('about.address') }}
                        </p>
                    </div>

                </div>

            </div>

        </div>
    </section>
</template>