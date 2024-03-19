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

const selecteddata = ref(null);
const dataReceived = ref(null);
const department_id = ref(null);
const datamasters = ref({});
const dt = ref(null);
const filters = ref({});
const loading = ref(null);
const s_locs = ref([]);
const idfromroute = ref(null);

const items = ref([{ label: 'Inbound', route: '/inbound' }, { label: 'Detail' }]);

onBeforeMount(async () => {
    const storeDepartmentid = store.state.department_id;
    dataReceived.value = router.currentRoute.value.meta ? router.currentRoute.value.meta.dataToSend.value : null;
});

const onPage = async () => {
    try {
        const apiUrl = `${apiBaseUrl}/api/inbound/${idfromroute.value}`;

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
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
};

onMounted(async () => {
    idfromroute.value = router.currentRoute.value.params.id;  
  
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
        const apiUrl = `${apiBaseUrl}/api/inbound/${idfromroute.value}`; 
       
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
const releaseToSAP = async () => {
    try {
        const selectedIds = selecteddata.value.map(item => item.id);

        const apiUrl = `${apiBaseUrl}/api/sap/releaseSAPin`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ selectedIds })
        });

        const responseData = await response.json();

        if (response.ok) {
            selecteddata.value = [];
            onPage();
            toast.add({ severity: 'success', summary: 'Success', detail: responseData.message, life: 5000 });
        } else {
            throw new Error(responseData.error || 'Failed to release data');
        }
    } catch (error) {
        console.error('Error releasing data:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to release data', life: 5000 });
    }
};
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
                <pre>{{datamasters}}</pre>
                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-1">
                            <h5 class="m-0">Inbound</h5>
                        </div>
                    </template>
                    <template v-slot:end>
                        <div class="my-1">
                            <p class="m-0" style="color: black">Status : {{datamasters.status}}</p>
                        </div>
                    </template>
                </Toolbar>
                <Divider />
                <div class="grid grid-nogutter">

                    <div class="col-12 md:col-7 lg:col-7 grid grid-nogutter">
                        <div class="px-3 py-1 col-6 md:col-4 lg:col-4"><small>Inbound Date</small></div>
                        <div class="px-3 py-1 col-6 md:col-8 lg:col-8"><small>: {{ datamasters.date }}</small></div>
                    </div>
                    <div class="col-12 md:col-5 lg:col-5 grid grid-nogutter">
                        <div class="px-3 py-1 col-6 md:col-5 lg:col-5"><small>Storage Location</small></div>
                        <div class="px-3 py-1 col-6 md:col-7 lg:col-7"><small>: {{ datamasters.s_loc}}</small></div>
                    </div>

                    <div class="col-12 md:col-7 lg:col-7 grid grid-nogutter">
                        <div class="px-3 py-1 col-6 md:col-4 lg:col-4"><small>Reference Doc</small></div>
                        <div class="px-3 py-1 col-6 md:col-8 lg:col-8"><small>: {{ datamasters?.inbound_material}}</small></div>
                    </div>
                    <div class="col-12 md:col-5 lg:col-5 grid grid-nogutter">
                        <div class="px-3 py-1 col-6 md:col-5 lg:col-5"><small>From</small></div>
                        <div class="px-3 py-1 col-6 md:col-7 lg:col-7"><small>: {{ datamasters.from}}</small></div>
                    </div>

                    <div class="col-12 md:col-7 lg:col-7 grid grid-nogutter">
                        <div class="px-3 py-1 col-6 md:col-4 lg:col-4"><small>Type</small></div>
                        <div class="px-3 py-1 col-6 md:col-8 lg:col-8"><small>: {{ datamasters.ref_type}}</small></div>
                    </div>

                    <div class="col-12 md:col-5 lg:col-5 grid grid-nogutter">                      
                    </div>           
                </div>
                <Divider class="mb-5" />

                <Toolbar class="bg-white border-none">
                    <template v-slot:end>
                        <Button label="Release to SAP" class="p-button-primary" v-if="selecteddata && selecteddata.length" @click="releaseToSAP"/>
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="datamasters.inbound_material" v-model:selection="selecteddata" :filters="filters" :loading="loading" dataKey="id" class="p-datatable-gridlines" :rows="10" responsiveLayout="scroll">
                    <Column selectionMode="multiple" headerStyle="width:5%"></Column>
                    <Column field="rowIndex" headerStyle="width:5%;" style="text-align: center">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 100%">
                                <span style="width: 100%">No</span>
                            </div>
                        </template>
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column field="material_code" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material_code }}
                        </template>
                    </Column>
                    <Column field="material_description" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Material Description</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material_description }}
                        </template>
                    </Column>
                    <Column field="item" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Item</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.item }}
                        </template>
                    </Column>
                    <Column field="plant" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Plant</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.plant }}
                        </template>
                    </Column>
                    <Column field="qty" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Qty</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.qty }}
                        </template>
                    </Column>
                    <Column field="uom" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">UoM</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.uom_name }}
                        </template>
                    </Column>
                    <Column field="batch" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Batch</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.batch }}
                        </template>
                    </Column>
                    <Column field="s_bin" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Storage Bin</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.s_bin }}
                        </template>
                    </Column>
                </DataTable>

                <div class="my-5"></div>
          
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
