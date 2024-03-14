import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { useStore } from 'vuex';
import { ref } from 'vue';

const department_name = ref(null);
const department_id = ref(null);

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true, title: 'Halaman Utama' }
                },
                {
                    path: '/inbound',
                    name: 'inbound',
                    component: () => import('@/views/layout/inbound/InboundPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/inbound/:id',
                    name: 'inbound/id',
                    component: () => import('@/views/layout/inbound/InbounddetailPage.vue'),
                    meta: {
                        requiresAuth: true,
                        dataToSend: {
                            value: 'admin'
                        }
                    }
                },
                {
                    path: '/outbound',
                    name: 'outbound',
                    component: () => import('@/views/layout/outbound/OutboundPage.vue'),
                    meta: {
                        requiresAuth: true,
                        dataToSend: {
                            value: 'admin'
                        }
                    }
                },
                {
                    path: '/outbound/:id',
                    name: 'outbound/id',
                    component: () => import('@/views/layout/outbound/OutbounddetailPage.vue'),
                    meta: {
                        requiresAuth: true,
                        dataToSend: {
                            value: 'admin'
                        }
                    }
                },
                {
                    path: '/outbound-overview',
                    name: 'outbound-overview',
                    component: () => import('@/views/layout/outbound/OutboundPage.vue'),
                    meta: {
                        requiresAuth: true,
                        dataToSend: {
                            value: 'overview'
                        }
                    }
                },
                {
                    path: '/outbound-request',
                    name: 'outbound-request',
                    component: () => import('@/views/layout/outbound/OutboundoverPage.vue'),
                    meta: {
                        requiresAuth: true,
                        dataToSend: {
                            value: 'request'
                        }
                    }
                },
                {
                    path: '/outbound-request/form-outbound',
                    name: 'outbound-request/form-outbound',
                    component: () => import('@/views/layout/outbound/OutboundformPage.vue'),
                    meta: {
                        requiresAuth: true,
                        dataToSend: {
                            value: 'request'
                        }
                    }
                },
                {
                    path: '/master-material',
                    name: 'master-material',
                    component: () => import('@/views/layout/master/MaterialPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/master-storagebin',
                    name: 'master-storagebin',
                    component: () => import('@/views/layout/master/StoragebinPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/master-slocation',
                    name: 'master-slocation',
                    component: () => import('@/views/layout/master/SlocationPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/master-department',
                    name: 'master-department',
                    component: () => import('@/views/layout/master/DepartmentPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/master-cost',
                    name: 'master-cost',
                    component: () => import('@/views/layout/master/CostPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/master-movement',
                    name: 'master-movement',
                    component: () => import('@/views/layout/master/MovementPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/master-recipient',
                    name: 'master-recipient',
                    component: () => import('@/views/layout/master/RecipientPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/master-uom',
                    name: 'master-uom',
                    component: () => import('@/views/layout/master/UomPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/master-category',
                    name: 'master-category',
                    component: () => import('@/views/layout/master/AdjcategoryPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/material-loc',
                    name: 'material-loc',
                    component: () => import('@/views/layout/MateriallogPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/adjustment',
                    name: 'adjustment',
                    component: () => import('@/views/layout/inventory/AdjustmentPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/adjustment/form-adjustment',
                    name: 'adjustment/form',
                    component: () => import('@/views/layout/inventory/AdjustmentformPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/adjustment/:id',
                    name: 'adjustment/id',
                    component: () => import('@/views/layout/inventory/AdjustmentdetailPage.vue'),
                    meta: {
                        requiresAuth: true,
                        dataToSend: {
                            value: 'admin'
                        }
                    }
                },
                {
                    path: '/report',
                    name: 'report',
                    component: () => import('@/views/layout/ReportPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/user',
                    name: 'user',
                    component: () => import('@/views/layout/UserPage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/role',
                    name: 'role',
                    component: () => import('@/views/layout/RolePage.vue'),
                    meta: { requiresAuth: true }
                },
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    const store = useStore();

    // Cek apakah rute memerlukan autentikasi
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        // Cek apakah pengguna telah login (gunakan kondisi yang sesuai)
        const isAuthenticated = localStorage.getItem('token') !== null;

        if (!isAuthenticated) {
            next('/auth/login');
        } else {
            const token = localStorage.getItem('token');
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const expirationTimestamp = tokenData.exp * 1000;
            const expirationDate = new Date(expirationTimestamp);

            // console.log('Token expired on:', expirationDate);

            // Cek apakah token sudah kedaluwarsa
            if (expirationDate <= new Date()) {
                // Hapus token dari penyimpanan lokal
                localStorage.removeItem('token');
                store.commit('resetState');

                // Jika sudah kedaluwarsa, redirect ke halaman login
                next('/auth/login');
            } else {
                await store.dispatch('fetchDepartmentData');
                // Now, department data is set in the store
                // You can access it using store.state.department_name and store.state.department_id
                department_name.value = store.state.department_name;
                department_id.value = store.state.department_id;
                // Jika belum kedaluwarsa, izinkan navigasi
                next();
            }
        }
    } else {
        if (to.path === '/auth/login' && localStorage.getItem('token') !== null) {
            // Jika pengguna sudah login, redirect ke halaman beranda atau halaman lain
            next('/');
        } else {
            next();
        }
    }
});

export default router;
