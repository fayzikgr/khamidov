<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ModalForm from '../components/ConsultModal.vue'
import BankruptcyWomen from '../images/bankruptcy_women.svg?component'

const { t } = useI18n()
const isOpen = ref(false)

// ✅ пункты через computed (чтобы язык менялся сразу)
const items = computed(() => [
    t('bankruptcy.i1'),
    t('bankruptcy.i2'),
    t('bankruptcy.i3')
])
</script>

<template>
    <section class="bg-[#f6f7f8] dark:bg-gray-800 py-10 sm:py-14 transition-colors">
        <div class="mx-auto container px-4 sm:px-6">
            <div class="relative overflow-hidden rounded-[28px] sm:rounded-[48px] bg-white dark:bg-gray-900
               shadow-[0_30px_90px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.5)]
               px-5 py-8 sm:px-10 sm:py-12 md:px-16 md:py-16 transition-colors">

                <div class="grid items-center gap-10 md:grid-cols-2 md:gap-8">

                    <!-- TEXT -->
                    <div class="max-w-[560px]">
                        <h1 class="text-[#111827] dark:text-white font-medium leading-[1.1]
                     text-3xl sm:text-4xl lg:text-[60px]">
                            {{ t('bankruptcy.title') }}
                        </h1>

                        <ul class="mt-8 space-y-4">
                            <li v-for="(item, i) in items" :key="i" class="flex gap-4 text-gray-800 dark:text-gray-300">
                                <span class="w-8 h-8 shrink-0 bg-gradient-to-r from-primary to-[var(--color-primary-end)] text-white rounded-full grid place-items-center shadow-md">✓</span>
                                <p>{{ item }}</p>
                            </li>
                        </ul>

                        <!-- BUTTON -->
                        <SpotlightButton @click="isOpen = true"
                            class="mt-8 h-[56px] px-8 rounded-[14px]  text-white font-semibold">
                            {{ t('bankruptcy.button') }}
                        </SpotlightButton>
                    </div>

                    <!-- IMAGE -->
                    <div class="flex justify-end">
                        <BankruptcyWomen class="w-[420px]" />
                    </div>

                </div>
            </div>
        </div>
    </section>

    <!-- MODAL -->
    <ModalForm :isOpen="isOpen" @close="isOpen = false" />
</template>