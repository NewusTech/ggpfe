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

const department_id = ref(null);
const datamasters = ref([]);
const datamaster = ref({});
const dt = ref(null);
const filters = ref({});
const loading = ref(null);
const s_locs = ref([]);
const ccs = ref([]);
const matlocs = ref([]);
const recipients = ref([]);
const mvts = ref([]);
const idfromroute = ref(null);
const submitted = ref(false);
const dateoutbound = ref();
const withRefence = ref(true);

const items = ref([{ label: 'Outbound', route: '/outbound-request' }, { label: 'Add Request' }]);

onBeforeMount(async () => {
    const storeDepartmentid = store.state.department_id;
    // console.log('plis', storeDepartmentid);
});

onMounted(async () => {
    idfromroute.value = router.currentRoute.value.params.id;
    // console.log('a', idfromroute);
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
            console.log(s_locs.value, 'tolol');
        } else {
            throw new Error(datastorage.error || 'Failed to fetch storage location data from API');
        }

        // Ambil data cost center dari Laravel API
        const response_cc = await fetch(`${apiBaseUrl}/api/cost_center/master_cost_center`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datacc = await response_cc.json();

        if (response_cc.ok) {
            ccs.value = datacc.data.data;
            console.log(ccs.value, 'tolol');
        } else {
            throw new Error(datacc.error || 'Failed to fetch storage location data from API');
        }

        // Ambil data datarecipient dari Laravel API
        const responseRecipient = await fetch(`${apiBaseUrl}/api/good_recipient/master_good_recipient`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datarecipient = await responseRecipient.json();

        if (responseRecipient.ok) {
            recipients.value = datarecipient.data.data;
        } else {
            throw new Error(datarecipient.error || 'Failed to fetch uom data from API');
        }

        // Ambil data mvt dari Laravel API
        const responsemvt = await fetch(`${apiBaseUrl}/api/mvt/master_movement_type`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datamvt = await responsemvt.json();

        if (responsemvt.ok) {
            mvts.value = datamvt.data.data;
        } else {
            throw new Error(datamvt.error || 'Failed to fetch uom data from API');
        }

        // Ambil data mat loc default dari Laravel API
        const responsmatloc = await fetch(`${apiBaseUrl}/api/material/master_material`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datamatloc = await responsmatloc.json();

        if (responsemvt.ok) {
            matlocs.value = datamatloc.data.data;
        } else {
            throw new Error(datamatloc.error || 'Failed to fetch uom data from API');
        }
    } catch (error) {
        console.error('Error fetching data from API:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const savewithreference = () => {
    console.log('input', datamaster.value);
    submitted.value = true;
};

const createnoreference = async () => {
    try {
        const material_code = [];
        const item = [];
        const qty = [];
        const requirement_date = [];

        datamasters.value.forEach((row) => {
            const date = new Date(row.date);
            const formattedDate = date.toISOString().split('T')[0];

            material_code.push(row.mat_code);
            item.push(row.item);
            qty.push(row.qty);
            requirement_date.push(formattedDate);
        });
         
        console.log({
            s_loc_id: datamaster.value.sloc,
            cost_center_id: datamaster.value.cost_center,
            receiving_s_loc: datamaster.value.rec_sloc,
            mvt_id: datamaster.value.mvt_type,
            good_recepient: datamaster.value.good_recepient,
            order: datamaster.value.order,
            material_code,
            item,
            qty,
            requirement_date
        });

        const response = await fetch(`${apiBaseUrl}/api/outbound/request/noreference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                s_loc_id: datamaster.value.sloc,
                receiving_s_loc: datamaster.value.rec_sloc,
                cost_center_id: datamaster.value.cost_center,
                mvt_id: datamaster.value.mvt_type,
                good_recepient: datamaster.value.good_recepient,
                order: datamaster.value.order,
                material_code,
                item,
                qty,
                requirement_date
            })
        });
        const data = await response.json();

        if (response.ok) {            
            datamasters.value = [];
            datamaster.value = {};
            submitted.value = false;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Input request not reference success', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to create Input request not reference');
        }
    } catch (error) {
        console.error('Error creating Input request not reference:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create Input request not reference', life: 5000 });
    }
};

const savenoreference = () => {
    submitted.value = true;

    const hasEmptyFields = datamasters.value.some(row => {
        return !row.item || !row.mat_code || !row.date || !row.plant;
    });

    console.log(datamasters.length , ' anjing ', datamasters.value.length)
    if (datamasters.value.length > 0 && datamaster.value.cost_center && datamaster.value.cost_center.id !== null && datamaster.value.good_recepient && datamaster.value.good_recepient.id !== null && datamaster.value.mvt_type && datamaster.value.mvt_type.id !== null && datamaster.value.sloc && datamaster.value.sloc.id !== null && datamaster.value.rec_sloc && datamaster.value.rec_sloc.id !== null && !hasEmptyFields) {
            createnoreference();
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Please make sure all material fields are filled, and at least one row is added with non-empty item, qty, and date.',
            life: 5000
        });
    }
};

const setWithReference = (value) => {
    withRefence.value = value;
    console.log(withRefence.value);
};

const updateMaterialInfo = (selectedMaterialCode) => {
    const selectedMaterial = matlocs.value.find(matloc => matloc.material_code === selectedMaterialCode);

    if (selectedMaterial) {
        datamasters.value.forEach((row) => {
            if (row.mat_code === selectedMaterialCode) {
                row.mat_desc = selectedMaterial.material_description;
                row.plant = selectedMaterial.plant;
                row.uom_id = selectedMaterial.uom_id;
            }
        });
    }
};

const addRow = () => {
    datamasters.value.push({ code: '', date: null });
};

const deleteRow = (index) => {
  datamasters.value.splice(index, 1);
  console.log(datamasters)
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

    <pre>{{ matlocs }}</pre>

    <Button label="With Reference" class="p-button-primary mr-2 px-3 py-2" @click="setWithReference(true)" :class="{ faded: !withRefence }" />

    <Button label="Without Reference" class="p-button-primary mr-2 px-3 py-2" @click="setWithReference(false)" :class="{ faded: withRefence }" />

    <div v-if="withRefence" class="grid mt-2">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-1">
                            <h5 class="m-0">Add Request With Reference</h5>
                        </div>
                    </template>
                    <template v-slot:end>
                        <Button label="Submit" class="p-button-danger mr-2 px-6" @click="savewithreference" />
                    </template>
                </Toolbar>
                <Divider />

                <div class="formgrid grid mb-3">
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="storageLocation" class="mr-1">Reference Document </label>
                            <p style="color: red">*</p>
                        </div>
                        <select
                            id="storageLocation"
                            v-model="datamaster.StorageLocation"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted && !datamaster.StorageLocation }"
                            style="appearance: auto"
                        >
                            <option v-for="loc in s_locs" :key="loc.id" :value="loc.id">{{ loc.s_loc }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.StorageLocation">Reference is required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="storageLocation" class="mr-1">Reference Date </label>
                        <input id="zip" type="text" class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" disabled />
                    </div>

                    <div class="field col-12 md:col-6 mb-4">
                        <label for="storageLocation">Storage Location</label>
                        <input id="zip" type="text" class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" disabled />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="storageLocation">Movement Type</label>
                        <input id="zip" type="text" class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" disabled />
                    </div>

                    <div class="field col-12 md:col-6 mb-4">
                        <label for="zip">Good Recipient</label>
                        <input id="zip" type="text" class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" disabled />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="zip">Cost Center</label>
                        <input id="zip" type="text" class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" disabled />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="zip">Order</label>
                        <input id="zip" type="text" class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" disabled />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="storageLocation">Receiving Storage Location</label>
                        <input id="zip" type="text" class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" disabled />
                    </div>
                </div>

                <DataTable ref="dt" :value="datamasters.data" dataKey="id" class="p-datatable-gridlines" responsiveLayout="scroll">
                    <Column field="code" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column field="mat_description" headerStyle="width:25%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Material Desciption</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column field="Plant" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
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
                            {{ slotProps.data.uom }}
                        </template>
                    </Column>
                    <Column field="date" headerStyle="width:25%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Requirement Date</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.mvt_id }}
                        </template>
                    </Column>
                </DataTable>

                <div class="my-5"></div>
            </div>
        </div>
    </div>

    <div v-if="!withRefence" class="grid mt-2">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-1">
                            <h5 class="m-0">Add Request Without Reference</h5>
                        </div>
                    </template>
                    <template v-slot:end>
                        <Button label="Submit" class="p-button-primary mr-2 px-6" @click="savenoreference" />
                    </template>
                </Toolbar>
                <Divider />

                <div class="formgrid grid mb-3">
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="mvt_type" class="mr-1">Movement Type</label>
                            <p style="color: red">*</p>
                        </div>
                        <select
                            id="mvt_type"
                            v-model="datamaster.mvt_type"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted && !datamaster.mvt_type }"
                            style="appearance: auto"
                        >
                            <option v-for="mvt in mvts" :key="mvt.id" :value="mvt.id">{{ mvt.mvt_code }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.mvt_type">Movement Type is required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="sloc" class="mr-1">Storage Location</label>
                            <p style="color: red">*</p>
                        </div>
                        <select
                            id="sloc"
                            v-model="datamaster.sloc"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted && !datamaster.sloc }"
                            style="appearance: auto"
                        >
                            <option v-for="loc in s_locs" :key="loc.id" :value="loc.id">{{ loc.s_loc }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.sloc">Storage Location is required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="good_recepient" class="mr-1">Good Recipient</label>
                            <p style="color: red">*</p>
                        </div>
                        <select
                            id="good_recepient"
                            v-model="datamaster.good_recepient"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted && !datamaster.good_recepient }"                     
                            style="appearance: auto"
                        >
                            <option v-for="rec in recipients" :key="rec.id" :value="rec.id">{{ rec.code }}</option>
                        </select>      
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.good_recepient">Good Recipient is required.</small>                             
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="cost_center" class="mr-1">Cost Center</label>
                            <p style="color: red">*</p>
                        </div>
                        <select
                            id="cost_center"
                            v-model="datamaster.cost_center"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"                           
                            :class="{ 'border-red-500': submitted && !datamaster.cost_center }"
                            style="appearance: auto"
                        >
                            <option v-for="cc in ccs" :key="cc.id" :value="cc.id">{{ cc.cost_center }}</option>
                        </select>   
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.cost_center">Cost Center is required.</small>                     
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="order">Order</label>
                        <input v-model.trim="datamaster.order" type="text" class="text-base surface-overlay text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="rec_sloc" class="mr-1">Receiving Storage Location</label>
                            <p style="color: red">*</p>
                        </div>
                        <select
                            id="rec_sloc"
                            v-model="datamaster.rec_sloc"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted && !datamaster.rec_sloc }"
                            style="appearance: auto"
                        >
                            <option v-for="loc in s_locs" :key="loc.id" :value="loc.id">{{ loc.s_loc }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.rec_sloc">Storage Location is required.</small>
                    </div>
                </div>

                <!-- <DataTable ref="dt" :value="datamasters.data" dataKey="id" class="p-datatable-gridlines" responsiveLayout="scroll">
                    <Column field="code" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column field="mat_description" headerStyle="width:25%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Material Desciption</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column field="Plant" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
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
                            {{ slotProps.data.uom }}
                        </template>
                    </Column>
                    <Column field="date" headerStyle="width:25%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Requirement Date</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.mvt_id }}
                        </template>
                    </Column>
                </DataTable> -->

                <DataTable :value="datamasters" dataKey="id" class="p-datatable-gridlines" responsiveLayout="scroll">
                    <Column field="code" headerStyle="min-width:160px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <select
                                id="mat_code"
                                v-model="slotProps.data.mat_code" @change="updateMaterialInfo(slotProps.data.mat_code)"
                                class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                                style="appearance: auto"
                            >
                                <option v-for="matloc in matlocs" :key="matloc.id" :value="matloc.material_code">{{ matloc.material_code }}</option>
                            </select>
                        </template>
                    </Column>
                    <Column field="mat_desc" headerStyle="min-width:220px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Description</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full bg-dark" v-model="slotProps.data.mat_desc" disabled/>
                        </template>
                    </Column>
                    <Column field="item" headerStyle="min-width:100px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Item</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full" v-model="slotProps.data.item" />
                        </template>
                    </Column>
                    <Column field="plant" headerStyle="min-width:100px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Plant</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full bg-dark" v-model="slotProps.data.plant" disabled />
                        </template>
                    </Column>
                    <Column field="qty" headerStyle="min-width:100px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Qty</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full" v-model="slotProps.data.qty" />
                        </template>
                    </Column>
                    <Column field="uom_id" headerStyle="min-width:100px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">UoM</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full bg-dark" v-model="slotProps.data.uom_id" disabled/>
                        </template>
                    </Column>
                    <Column field="code" headerStyle="min-width:170px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Requirement Date</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <Calendar v-model="slotProps.data.date" class="w-full" showIcon iconDisplay="input" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:80px">
                        <template #body="slotProps">
                            <Button icon="pi pi-trash" class="border-none" style="background: white; color:red" @click="() => deleteRow(slotProps.$index)" />
                        </template>
                    </Column>               
                </DataTable>              

                <Button label="Add Row" :style="{ background: 'white', color: 'blue' }" class="mt-3" @click="addRow" />

                <div class="my-5"></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.faded {
    opacity: 0.5; /* You can adjust the opacity value as needed */
}
</style>
