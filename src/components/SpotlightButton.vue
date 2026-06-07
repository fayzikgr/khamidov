<script setup>
import { ref } from 'vue';

const btnRef = ref(null);

const handleMouseMove = (e) => {
    if (!btnRef.value) return;
    const rect = btnRef.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btnRef.value.style.setProperty('--x', `${x}px`);
    btnRef.value.style.setProperty('--y', `${y}px`);
};
</script>

<template>
    <button 
        ref="btnRef" 
        @mousemove="handleMouseMove" 
        class="spotlight-btn group relative overflow-hidden text-white font-semibold flex items-center justify-center transition-all duration-300"
    >
        <!-- Spotlight Glow Overlay (Follows Cursor) -->
        <span class="spotlight absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></span>
        
        <!-- Content -->
        <span class="relative z-10 flex items-center justify-center w-full h-full gap-2">
            <slot></slot>
        </span>
    </button>
</template>

<style scoped>
.spotlight-btn {
    border-radius: var(--radius-btn, 14px);
    background: linear-gradient(var(--gradient-dir, to right), var(--color-primary, #008d80), var(--color-primary-end, #00bfa6));
}

.spotlight {
    /* Create a bright circle at the mouse coordinates */
    background: radial-gradient(
        circle 80px at var(--x, 50%) var(--y, 50%), 
        rgba(255, 255, 255, 0.35) 0%, 
        transparent 100%
    );
    mix-blend-mode: overlay;
}

.spotlight-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 0, 0, var(--glow-opacity, 0.5));
}

.spotlight-btn:active {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 5px 15px rgba(0, 0, 0, var(--glow-opacity, 0.3));
}
</style>
