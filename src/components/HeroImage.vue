<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';

const imageContainer = ref(null);
const image = ref(null);

onMounted(() => {
    // 3D Entrance Animation
    gsap.fromTo(imageContainer.value, 
        { scale: 0.8, opacity: 0, rotateY: 15 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 1.5, ease: 'power3.out' }
    );
});

const handleMouseMove = (e) => {
    if (!imageContainer.value) return;
    const rect = imageContainer.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    gsap.to(image.value, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        ease: "power2.out",
        duration: 0.5
    });
};

const handleMouseLeave = () => {
    gsap.to(image.value, {
        rotateX: 0,
        rotateY: 0,
        ease: "power3.out",
        duration: 1
    });
};
</script>

<template>
    <div ref="imageContainer" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave" class="w-full max-w-[600px] h-96 rounded-[32px] overflow-hidden group shadow-2xl relative cursor-pointer" style="perspective: 1000px;">
        <img ref="image" src="../images/khamidov.jpg"
            class="w-full h-full object-cover object-[center_20%] transition-transform duration-500 scale-[1.05] group-hover:scale-[1.15]">
        
        <!-- Glow Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
    </div>
</template>