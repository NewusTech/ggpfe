<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import { apiBaseUrl } from '@/config/apiConfig';
import { useStore } from 'vuex';

const store = useStore();
const user_name = ref(null);

const { layoutConfig, onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();

onBeforeUnmount(() => {   
    unbindOutsideClickListener();
});

onBeforeMount(() => {
    const storeName = store.state.user_name; 

    if (storeName !== null) {
        user_name.value = storeName.split(' ')[0];      
    } else {
        store.watch(
            (state) => state.user_name,
            (newVal) => {
                user_name.value = newVal.split(' ')[0];
            }
        );       
    }  
});

onMounted(() => {
    bindOutsideClickListener();    
});

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};
const onSettingsClick = async () => {
    await fetch(`${apiBaseUrl}/api/auth/logout/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },      
    })
    .then(response => {
        // Handle respons dari server
        if (response.ok) {
            // Logout berhasil, arahkan pengguna ke halaman login atau halaman lain yang sesuai
            localStorage.removeItem('token');    
            store.commit('resetState');  
            router.push('/auth/login');
        } else {
            // Logout gagal, handle kesalahan atau tampilkan pesan kesalahan
            console.error('Logout failed');
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });

    // Tutup dropdown atau menu jika diperlukan
    topbarMenuActive.value = false;
};
const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <!-- <img :src="logoUrl" alt="logo" /> -->
            <span>WMS Warehouse</span>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <!-- <i class="pi pi-bars"></i> -->
            <i class="bi bi-grid-3x3-gap-fill"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                <img alt="flag" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`flag flag-uk`" style="width: 24px" />
                <span>Notifikasi</span>
            </button>
            <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button mr-3">
                <i class="pi pi-bell"></i>
                <span>Notifikasi</span>
            </button>
            <button class="p-link layout-topbar-button" style="border-radius: 50%; background-color: #e2e2e2;">
                <p class="mt-3">AS</p>
                <span>Profile</span>
            </button>
            <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                <p class="mt-3">{{user_name}}</p>
                <span>Profile</span>
            </button>
            <button @click="onSettingsClick()" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Logout</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
