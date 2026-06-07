<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const name = ref('');
const phone = ref('');
const problem = ref('');
const time = ref('');
const isSubmitting = ref(false);

const submitOrder = async () => {
    if (!name.value || !phone.value) {
        alert("Заполните имя и телефон / Ism va telefonni kiriting");
        return;
    }

    isSubmitting.value = true;
    try {
        const res = await fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.value,
                phone: phone.value,
                time: time.value,
                problem: problem.value
            })
        });

        if (res.ok) {
            alert("Заявка отправлена ✅ / Ariza yuborildi ✅");
            router.push('/');
        } else {
            alert("Ошибка сервера. Пожалуйста, попробуйте позже.");
        }
    } catch (error) {
        alert("Ошибка подключения к серверу.");
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-10 bg-[#f6f7f8] pt-32">
        <div class="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">
            <h2 class="text-3xl font-bold mb-2 text-[#3c3c3c]"> Заявка / Ariza </h2>
            <p class="text-gray-500 mb-6 text-sm"> Ответим в течение 7 минут / 7 daqiqa ichida javob beramiz </p>
            
            <div class="space-y-4">
                <textarea v-model="problem" placeholder="Опишите вашу тему / Mavzuni yozing"
                    class="w-full h-28 border border-gray-300 rounded-2xl p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none"></textarea>
                
                <input v-model="name" type="text" placeholder="Ваше имя / Ismingiz"
                    class="w-full border border-gray-300 rounded-2xl p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
                
                <input v-model="phone" type="text" placeholder="+998 __ ___ __ __"
                    class="w-full border border-gray-300 rounded-2xl p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
                
                <select v-model="time" class="w-full border border-gray-300 rounded-2xl p-4 outline-none focus:border-primary bg-white">
                    <option disabled value="">Выберите время консультации / Vaqtni tanlang</option>
                    <option>10:00</option>
                    <option>12:00</option>
                    <option>15:00</option>
                    <option>18:00</option>
                </select>
                
                <label class="flex items-start gap-3 text-sm text-gray-500 cursor-pointer">
                    <input type="checkbox" checked class="mt-1 accent-primary" />
                    Даю согласие на обработку персональных данных / Ma'lumotlarni qayta ishlashga roziman
                </label>
                
                <button @click="submitOrder" :disabled="isSubmitting"
                    class="w-full h-14 bg-gradient-to-r from-primary to-[var(--color-primary-end)] hover:scale-[1.02] transition-transform text-white rounded-2xl font-bold shadow-lg">
                    {{ isSubmitting ? 'Отправка...' : 'Подать заявку / Yuborish' }}
                </button>
                
                <p class="text-center text-xs text-gray-400"> Нажимая кнопку, вы соглашаетесь с условиями </p>
            </div>
        </div>
    </div>
</template>