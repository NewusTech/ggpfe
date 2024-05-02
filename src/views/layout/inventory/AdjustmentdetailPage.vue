<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();

const toast = useToast();

const selectedProducts = ref(null);
const dataReceived = ref(null);
const department_id = ref(null);
const datamasters = ref([]);
const dt = ref(null);
const filters = ref({});
const loading = ref(null);
const s_locs = ref([]);
const idfromroute = ref(null);

const items = ref([{ label: 'Adjustment', route: '/adjustment' }, { label: 'Detail' }]);

onBeforeMount(async () => {
    const storeDepartmentid = store.state.department_id;
    // console.log('plis', storeDepartmentid);

    dataReceived.value = router.currentRoute.value.meta ? router.currentRoute.value.meta.dataToSend.value : null;
    // console.log('Received data:', dataReceived.value);
});

onMounted(async () => {
    idfromroute.value = router.currentRoute.value.params.id;  
    // console.log('a', idfromroute)
    try {
        // get data user
        const responseUSER = await fetch(`${apiBaseUrl}/api/auth/get_user/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const datauser = await responseUSER.json();

        department_id.value = datauser.data.departement_id;

        //get data master
        const apiUrl = `${apiBaseUrl}/api/outbound/${idfromroute.value}`; 
        //  const apiUrl = `${apiBaseUrl}/api/outbound`;

        // console.log('api', apiUrl);

        // Fetch data from Laravel API
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            datamasters.value = data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch data from API');
        }

        // Ambil data departemen dari Laravel API
        const response_location = await fetch(`${apiBaseUrl}/api/sloc/master_storage_location`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datastorage = await response_location.json();

        if (response_location.ok) {
            s_locs.value = datastorage.data.data;
        } else {
            throw new Error(datastorage.error || 'Failed to fetch storage location data from API');
        }
    } catch (error) {
        // console.error('Error fetching data from API:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});
</script>

<template>
    <Breadcrumb :model="items">
        <template #item="{ item, props }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a :href="href" v-bind="props.action" @click="navigate">
                    <span :class="[item.icon, 'text-color']" />
                    <span class="text-primary font-semibold">{{ item.label }}</span>
                </a>
            </router-link>
            <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                <span class="text-color">{{ item.label }}</span>
            </a>
        </template>
    </Breadcrumb>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-1">
                            <h5 class="m-0">Adjustement CODE</h5>
                        </div>
                    </template>
                    <template v-slot:end>
                        <div class="my-1">
                            <p class="m-0" style="color: black">Status : {{datamasters.status}}</p>
                        </div>
                    </template>
                </Toolbar>
                <Divider />
                <div class="grid">
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter pt-3 pb-1">                        
                        <div class="px-3 py-1 col-6">Date</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Storage Location</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Category Adjustment</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Material Code</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Material Description</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Qty</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div> 
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Qty (physical)</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div> 
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Qty Adjustment</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>  
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">UoM</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>                    
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Batch</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>  
                    <div class="col-12 md:col-6 md:col-offset-3 lg:col-6 lg:col-offset-3 grid grid-nogutter py-1">                        
                        <div class="px-3 py-1 col-6">Description</div>
                        <div class="px-3 py-1 col-6">Dummy</div>
                    </div>  
                </div>                

                <div class="my-5"></div>
          
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
