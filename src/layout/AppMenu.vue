<script setup>
import { ref, onBeforeMount } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { useStore } from 'vuex';

const store = useStore();
const permission = ref(null);

onBeforeMount(async () => {
    // Menangani asynchronicity dengan menunggu nilai dari store
    const storePermission = store.state.permission;

    if (storePermission !== null) {
        permission.value = storePermission;
        // console.log("anjigngn", permission)
        initModel();
    } else {
        // Tunggu hingga nilai diupdate oleh fetch di AppLayout
        store.watch(
            (state) => state.permission,
            (newVal) => {       
                permission.value = newVal;
                initModel();
            }
        );
    }
});

const model = ref([]);

const initModel = () => {
    const hasViewRolePermission = permission.value.some(perm => perm.name === 'view-role');
    const hasViewUserPermission = permission.value.some(perm => perm.name === 'view-user');
    const hasViewMasterPermission = permission.value.some(perm => perm.name === 'view-master');

    model.value = [
    {
        items: [
            { label: 'Dashboard', icon: 'pi pi-th-large pi-id-card', to: '/' },
            hasViewMasterPermission ? {
                label: 'Master',
                icon: 'fas fa-warehouse',
                items: [
                    {
                        label: 'Material',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-material'
                    },
                    {
                        label: 'Storage Bin',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-storagebin'
                    },
                    {
                        label: 'S. Location',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-slocation'
                    },
                    { 
                        label: 'Department', 
                        icon: 'fas fa-circle',
                        size: 6, 
                        to: '/master-department'
                    },
                    {
                        label: 'Cost Center',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-cost'
                    },
                    {
                        label: 'Movement Type',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-movement'
                    },
                    {
                        label: 'Good Recipient',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-recipient'
                    },
                    {
                        label: 'UoM',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-uom'
                    },
                    {
                        label: 'Plant',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-plant'
                    },
                    {
                        label: 'Adjs. Category',
                        icon: 'fas fa-circle',
                        size: 6,
                        to: '/master-category'
                    }
                ]
            } : null,
            hasViewRolePermission ? { label: 'Role', icon: 'fas fa-id-card-clip', to: '/role' } : null,
            hasViewUserPermission ? { label: 'Users', icon: 'far fa-user', to: '/user' } : null
        ].filter(item => item !== null)
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
