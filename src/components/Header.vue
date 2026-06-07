<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { searchQuery } from '../store/search.js'

const route = useRoute()
const router = useRouter()

// 🌍 i18n
const { locale, t } = useI18n()

const changeLang = (lang) => {
    locale.value = lang
    localStorage.setItem('lang', lang)
}

const handleSearch = async () => {
    if (!searchQuery.value.trim()) return;
    await scrollToServices();
}
const scrollToServices = async () => {
    if (route.path !== '/') {
        await router.push('/')

        setTimeout(() => {
            const el = document.getElementById('services')
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }, 300)

        return
    }

    const el = document.getElementById('services')
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}
</script>

<template>
    <header class="w-full border-b border-gray-200 bg-white relative z-50 transition-colors">
        <div class="mx-auto max-w-[1200px] px-4">
            <div class="flex items-center justify-between py-4">

                <!-- LEFT -->
                <div class="flex items-center gap-5">
                    <h1 class="text-2xl font-semibold text-black transition-colors">
                        khamidov.uz
                    </h1>

                    <SpotlightButton @click="scrollToServices"
                        class="flex h-11 items-center gap-2 rounded-full  px-5 text-sm font-medium text-white hover:opacity-90 transition">
                        {{ t('header.services') }}
                    </SpotlightButton>

                    <div class="hidden md:flex flex-1 mx-6 max-w-xl shadow-sm rounded-full bg-white">
                        <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" :placeholder="t('header.search')"
                            class="h-11 w-full rounded-l-full border border-gray-300 px-5 outline-none focus:border-primary transition" />
                        <button @click="handleSearch" class="btn-primary h-11 px-8 text-sm font-bold text-white hover:opacity-90 transition flex items-center justify-center" style="border-radius: 0 9999px 9999px 0; margin-left: -1px;">
                            {{ t('header.find') }}
                        </button>
                    </div>
                </div>

                <!-- RIGHT -->
                <div class="flex items-center gap-4">

                    <!-- 🔥 ПЕРЕКЛЮЧАТЕЛЬ -->
                    <div class="flex items-center bg-gray-100 rounded-full p-1 transition-colors">
                        <button @click="changeLang('ru')" :class="locale === 'ru'
                            ? 'bg-white shadow text-gray-900'
                            : 'text-gray-600'" class="px-3 py-1 rounded-full text-sm transition">
                            RU
                        </button>

                        <button @click="changeLang('uz')" :class="locale === 'uz'
                            ? 'bg-white shadow text-gray-900'
                            : 'text-gray-600'" class="px-3 py-1 rounded-full text-sm transition">
                            UZ
                        </button>
                    </div>

                    <!-- SOCIALS -->
                    <div class="hidden lg:flex items-center gap-4 text-primary">
                        <a href="https://t.me/Khamdwww" target="_blank" class="hover:scale-110 transition">
                            <img src="../images/icons8-телеграм-50.png" class="w-7" />
                        </a>
                        <a href="https://api.whatsapp.com/send/?phone=998901605156&text&type=phone_number&app_absent=0" target="_blank" class="hover:scale-110 transition flex items-center justify-center">
                            <img src="../images/whatsapp-icon.png" class="w-7" />
                        </a>
                    </div>

                    <!-- PHONE -->
                    <a href="tel:+998901605156"
                        class="hidden lg:flex h-11 items-center rounded-full bg-black px-6 text-white text-sm">
                        +998 90 160-51-56
                    </a>

                </div>

            </div>
        </div>
    </header>
</template>