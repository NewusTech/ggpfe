<script setup>
import { ref, onBeforeMount } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { useStore } from 'vuex';

const store = useStore();
const permission = ref(null);
const department = ref(null);

onBeforeMount(async () => {
    // Menangani asynchronicity dengan menunggu nilai dari store
    const storePermission = store.state.permission;
    const storedepartment = store.state.department_name;

    console.log("adsnjikasduihasdbhadshdasbhasdhk", store.state)

    if (storePermission !== null) {
        permission.value = storePermission;
        initModel();
    } else {
        store.watch(
            (state) => state.permission,
            (newVal) => {
                permission.value = newVal;
                initModel();
            }
        );
    }

    if (storedepartment !== null) {
        department.value = storedepartment;
        initModel();
    } else {
        store.watch(
            (state) => state.department,
            (newVal) => {
                department.value = newVal;
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
    const hasViewInboundPermission = permission.value.some(perm => perm.name === 'view-inbound');
    const hasViewOutboundPermission = permission.value.some(perm => perm.name === 'view-outbound');
    const hasViewMaterialLocationPermission = permission.value.some(perm => perm.name === 'view-material-location');

    model.value = [
        {
            items: [
                { label: 'Dashboard', icon: 'pi pi-th-large pi-id-card', to: '/' },
                hasViewMaterialLocationPermission ? { label: 'Material Loc.', icon: 'fas fa-id-card-clip', to: '/material-location' } : null,

                hasViewInboundPermission && department.value !== 'Central' ? { label: 'Inbound', icon: 'fas fa-reply', to: '/inbound' } : null,

                hasViewOutboundPermission && (department.value === 'Central') ? { label: 'Outbound', icon: 'fas fa-reply', to: '/outbound' } : null,

                hasViewOutboundPermission && (department.value === 'Sparepart' || !department.value) ? {
                    label: 'Outbound',
                    icon: 'fas fa-reply',
                    items: [
                        { label: 'Overview', icon: 'fas fa-circle', size: 6, to: '/outbound-overview' },
                        // { label: 'Request', icon: 'fas fa-circle', size: 6, to: '/outbound-request' }
                    ]
                } : null,

                // ...(department_name.value === "Sparepart"
                //     ? [
                //         {
                //             label: 'Outbound',
                //             icon: 'fas fa-reply',
                //             items: [
                //                 { label: 'Overview', icon: 'fas fa-circle', size: 6, to: '/outbound-overview' },
                //                 { label: 'Request', icon: 'fas fa-circle', size: 6, to: '/outbound-request' }
                //             ]
                //         }
                //     ]
                //     : []),

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
    ]
};
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
