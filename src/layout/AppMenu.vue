<script setup>
import { ref, onBeforeMount } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { useStore } from 'vuex';

const store = useStore();
const department_name = ref(null);
const department_id = ref(null);

onBeforeMount(async () => {
    // Menangani asynchronicity dengan menunggu nilai dari store
    const storeDepartmentName = store.state.department_name;
    // console.log(storeDepartmentName)

    if (storeDepartmentName !== null) {
        department_name.value = storeDepartmentName;
        initModel();
    } else {
        // Tunggu hingga nilai department_name diupdate oleh fetch di AppLayout
        store.watch(
            (state) => state.department_name,
            (newVal) => {                
                department_name.value = newVal;
                initModel();
            }
        );
    }
});

const model = ref([]);

const initModel = () => {
    model.value = [
    {
        items: [
            { label: 'Dashboard', icon: 'pi pi-th-large pi-id-card', to: '/' },
            ...(department_name.value === "Admin"
                ? [{ label: 'Role', icon: 'fas fa-id-card-clip', to: '/role' }]
                : []),
        ]
    },
]};
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
