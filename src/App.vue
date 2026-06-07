<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Header from './components/Header.vue';
import ChatWidget from './components/ChatWidget.vue';

const { t, mergeLocaleMessage } = useI18n();

onMounted(async () => {
    try {
        const res = await fetch('/api/settings');
        if (res.ok) {
            const data = await res.json();
            
            // Apply dynamic theme variables
            if (data.primaryColor) {
                document.documentElement.style.setProperty('--color-primary', data.primaryColor);
            }
            if (data.primaryColorEnd) {
                document.documentElement.style.setProperty('--color-primary-end', data.primaryColorEnd);
            }
            if (data.glowIntensity) {
                const opacityMap = { low: '0.2', medium: '0.5', high: '0.8' };
                document.documentElement.style.setProperty('--glow-opacity', opacityMap[data.glowIntensity] || '0.5');
            }
            if (data.gradientDirection) {
                document.documentElement.style.setProperty('--gradient-dir', data.gradientDirection);
            }
            if (data.borderRadius) {
                document.documentElement.style.setProperty('--radius-btn', data.borderRadius);
            }
            if (data.texts) {
                if (data.texts.uz) mergeLocaleMessage('uz', data.texts.uz);
                if (data.texts.ru) mergeLocaleMessage('ru', data.texts.ru);
            }
        }
    } catch (e) {
        console.error('API connection failed, using defaults.');
    }

    // Initialize UI
    document.documentElement.classList.remove('dark');
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 tracking-wider">
   
    <Header />
    <router-view />
    <ChatWidget />
    
  </div>
</template>