import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Order from '../pages/Order.vue'
import Admin from '../pages/Admin.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/order', component: Order },
    { path: '/admin', component: Admin },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})