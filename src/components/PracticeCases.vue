<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ConsultModal from './ConsultModal.vue'
import { searchQuery } from '../store/search.js'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()
const containerRef = ref(null)
const isModalOpen = ref(false)

onMounted(() => {
    gsap.fromTo(containerRef.value.children, 
        { y: 100, opacity: 0, scale: 0.9, rotationX: 15, transformPerspective: 1000 },
        { 
            y: 0, opacity: 1, scale: 1, rotationX: 0, 
            duration: 0.7, 
            stagger: 0.1, 
            ease: 'back.out(1.5)',
            scrollTrigger: {
                trigger: containerRef.value,
                start: "top 85%"
            }
        }
    )
})

const cards = computed(() => [
    {
        row: 1,
        icon: "👥",
        title: t('cases.c1.title'),
        items: [
            t('cases.c1.i1'),
            t('cases.c1.i2'),
            t('cases.c1.i3'),
            t('cases.c1.i4')
        ]
    },
    {
        row: 1,
        icon: "💍",
        title: t('cases.c2.title'),
        items: [
            t('cases.c2.i1'),
            t('cases.c2.i2'),
            t('cases.c2.i3'),
            t('cases.c2.i4')
        ]
    },
    {
        row: 1,
        icon: "💼",
        title: t('cases.c3.title'),
        items: [
            t('cases.c3.i1'),
            t('cases.c3.i2'),
            t('cases.c3.i3'),
            t('cases.c3.i4')
        ]
    },
    {
        row: 1,
        icon: "🏛️",
        title: t('cases.c4.title'),
        items: [
            t('cases.c4.i1'),
            t('cases.c4.i2'),
            t('cases.c4.i3'),
            t('cases.c4.i4')
        ]
    }
])

const matchedIndices = computed(() => {
    if (!searchQuery.value.trim()) return []
    const term = searchQuery.value.toLowerCase()
    
    return cards.value.reduce((acc, card, idx) => {
        const titleMatch = card.title.toLowerCase().includes(term)
        const itemMatch = card.items.some(item => item.toLowerCase().includes(term))
        if (titleMatch || itemMatch) acc.push(idx)
        return acc
    }, [])
})

const cardBase =
    "rounded-3xl bg-white border border-slate-100 overflow-hidden flex flex-col shadow-[0_18px_40px_rgba(15,23,42,0.10)] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
</script>

<template>
    <section class="py-14 md:py-20 bg-white transition-colors" id="services">
        <div class="container mx-auto px-4 mt-12">

            <!-- Заголовок -->
            <h2 class="text-center text-4xl md:text-6xl text-slate-900">
                {{ t('cases.title') }}
                <span class="text-primary">{{ t('cases.highlight') }}</span>
                {{ t('cases.after') }}
            </h2>

            <div class="mt-6 flex justify-center">
                <p class="text-xl md:text-3xl font-semibold text-primary">
                    {{ t('cases.subtitle') }}
                </p>
            </div>

            <!-- Карточка -->
            <div ref="containerRef" class="mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <article v-for="(c, idx) in cards" :key="idx" 
                    :class="[
                        cardBase, 
                        matchedIndices.includes(idx) ? 'ring-4 ring-primary scale-105 shadow-[0_25px_50px_rgba(0,141,128,0.2)]' : ''
                    ]">
                    <div class="p-8 flex flex-col h-full">

                        <div class="mb-5 text-2xl">{{ c.icon }}</div>

                        <h3 class="text-2xl md:text-3xl text-slate-900 whitespace-pre-line leading-tight">
                            {{ c.title }}
                        </h3>

                        <div class="mt-8 border-t border-slate-200 flex-grow">
                            <div v-for="(it, i) in c.items" :key="i"
                                class="py-5 text-slate-700 border-b border-slate-200 last:border-b-0">
                                {{ it }}
                            </div>
                        </div>

                        <button @click.prevent="isModalOpen = true" class="mt-8 font-bold text-primary hover:opacity-80 transition text-left">
                            {{ t('cases.more') }} →
                        </button>

                    </div>
                </article>
            </div>

        </div>

        <ConsultModal :isOpen="isModalOpen" @close="isModalOpen = false" />
    </section>
</template>