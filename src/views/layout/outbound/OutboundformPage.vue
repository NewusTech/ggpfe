<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();

const toast = useToast();

const datamasters = ref([]);
const datamastersref = ref([]);
const datamaster = ref({});
const datamaster2 = ref({});
const dt = ref(null);
const listrefs = ref([]);
const s_locs = ref([]);
const ccs = ref([]);
const matlocs = ref([]);
const recipients = ref([]);
const mvts = ref([]);
const idfromroute = ref(null);
const submitted = ref(false);
const submitted2 = ref(false);
const dateoutbound = ref();
const withRefence = ref(true);

const items = ref([{ label: 'Outbound', route: '/outbound-request' }, { label: 'Add Request' }]);

onBeforeMount(async () => {
});

onMounted(async () => {
    idfromroute.value = router.currentRoute.value.params.id;

    try {
        // Ambil data reference list dari Laravel API
        const response_refs = await fetch(`${apiBaseUrl}/api/outbound/request/listwithref`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datarefs = await response_refs.json();

        if (response_refs.ok) {
            listrefs.value = datarefs.data.data;
        } else {
            throw new Error(datarefs.error || 'Failed to fetch data from API');
        }

        // Ambil data departemen dari Laravel API
        const response_location = await fetch(`${apiBaseUrl}/api/master/storage_location`, {
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
        const response_cc = await fetch(`${apiBaseUrl}/api/master/cost_center`, {
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
        const responseRecipient = await fetch(`${apiBaseUrl}/api/master/good_recepient`, {
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
        const responsemvt = await fetch(`${apiBaseUrl}/api/master/mvt`, {
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
        const responsmatloc = await fetch(`${apiBaseUrl}/api/master/material`, {
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

const onPage = async () => {
    try {
        // Ambil data reference list dari Laravel API
        const response_refs = await fetch(`${apiBaseUrl}/api/outbound/request/listwithref`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datarefs = await response_refs.json();

        if (response_refs.ok) {
            listrefs.value = datarefs.data.data;
        } else {
            throw new Error(datarefs.error || 'Failed to fetch data from API');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
};

const savewithreference = async () => {
    console.log('input', datamaster.value.refdocs);
    submitted.value = true;

    if (datamaster.value.refdocs) {
        console.log("ASDasdasdsda")
        
        try {

            const response = await fetch(`${apiBaseUrl}/api/outbound/request/requestWithreference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ids: datamaster.value.refdocs
                })
            });
            const data = await response.json();

            if (response.ok) {
                datamastersref.value = [];
                datamaster.value = {};
                submitted.value = false;
                onPage();
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Input request with reference success', life: 3000 });
            } else {
                throw new Error(data.error || 'Failed to create Input request not reference');
            }
        } catch (error) {
            console.error('Error creating Input request not reference:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create Input request not reference', life: 5000 });
        }

    }
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

            material_code.push(row.code);
            item.push(row.item);
            qty.push(row.qty);
            requirement_date.push(formattedDate);
        });

        console.log({
            s_loc_id: datamaster2.value.sloc,
            cost_center_id: datamaster2.value.cost_center,
            receiving_s_loc: datamaster2.value.rec_sloc,
            mvt_id: datamaster2.value.mvt_type,
            good_recepient: datamaster2.value.good_recepient,
            order: datamaster2.value.order,
            material_code,
            item,
            qty,
            requirement_date
        });

        const response = await fetch(`${apiBaseUrl}/api/outbound/request/requestNoreference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                s_loc_id: datamaster2.value.sloc,
                receiving_s_loc: datamaster2.value.rec_sloc,
                cost_center_id: datamaster2.value.cost_center,
                mvt_id: datamaster2.value.mvt_type,
                good_recepient: datamaster2.value.good_recepient,
                order: datamaster2.value.order,
                material_code,
                item,
                qty,
                requirement_date
            })
        });
        const data = await response.json();

        if (response.ok) {
            datamasters.value = [];
            datamaster2.value = {};
            submitted2.value = false;
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
    submitted2.value = true;

    const hasEmptyFields = datamasters.value.some(row => {
        return !row.item || !row.code || !row.date || !row.plant;
    });

    console.log(datamaster, ' anjing ', datamasters)
    if (datamasters.value.length > 0 && datamaster2.value.cost_center && datamaster2.value.good_recepient && datamaster2.value.mvt_type && datamaster2.value.sloc && datamaster2.value.rec_sloc && !hasEmptyFields) {
        console.log("if")
        createnoreference();
    } else {
        console.log("else")
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
    console.log(matlocs)
    console.log(selectedMaterialCode)
    const selectedMaterial = matlocs.value.find(matloc => matloc.id === selectedMaterialCode);
    console.log(selectedMaterial)

    if (selectedMaterial) {
        datamasters.value.forEach((row) => {
            if (row.code === selectedMaterialCode) {
                row.mat_desc = selectedMaterial.desc;
                row.plant = selectedMaterial.plant.name;
                row.uom_id = selectedMaterial.uom.name;
            }
        });
    }
};

const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
};

const updatereferencewithlist = (data) => {
    console.log("anjingnggg", data)
    const selected = listrefs.value.find(reff => reff.id === data);
    console.log("bsabi", selected)
    // const selectedMaterial = matlocs.value.find(matloc => matloc.material_code === selectedMaterialCode);

    if (selected) {
        datamaster.value.dateref = formatDate(selected.created_at)
        datamaster.value.slocref = selected.sloc.name
        datamaster.value.mvtref = selected.mvt.code
        datamaster.value.recepientref = selected.recepient.code
        datamaster.value.costref = selected.costcenter.name
        datamaster.value.orderref = selected.order
        datamaster.value.recslocref = selected.receivingsloc.name

        datamastersref.value = selected.outboundmaterialrequest

        console.log("asdasdhjghuasdhasd", datamastersref)
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

    <!-- <pre>{{ listrefs }}</pre> -->

    <Button label="With Reference" class="p-button-primary mr-2 px-3 py-2" @click="setWithReference(true)"
        :class="{ faded: !withRefence }" />

    <Button label="Without Reference" class="p-button-primary mr-2 px-3 py-2" @click="setWithReference(false)"
        :class="{ faded: withRefence }" />

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
                        <Button label="Submit" class="p-button-primary mr-2 px-6" @click="savewithreference" />
                    </template>
                </Toolbar>
                <Divider />

                <div class="formgrid grid mb-3">
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="refdocs" class="mr-1">Reference Document </label>
                            <p style="color: red">*</p>
                        </div>
                        <select id="refdocs" v-model="datamaster.refdocs"
                            @change="updatereferencewithlist(datamaster.refdocs)"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted && !datamaster.refdocs }" style="appearance: auto">
                            <option v-for="loc in listrefs" :key="loc.id" :value="loc.id">{{ loc.code }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.refdocs">Reference is
                            required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="dateref" class="mr-1">Reference Date </label>
                        <input id="dateref" v-model="datamaster.dateref" type="text"
                            class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full"
                            disabled />
                    </div>

                    <div class="field col-12 md:col-6 mb-4">
                        <label for="slocref">Storage Location</label>
                        <input id="slocref" v-model="datamaster.slocref" type="text"
                            class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full"
                            disabled />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="mvtref">Movement Type</label>
                        <input id="mvtref" v-model="datamaster.mvtref" type="text"
                            class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full"
                            disabled />
                    </div>

                    <div class="field col-12 md:col-6 mb-4">
                        <label for="recepientref">Good Recepient</label>
                        <input id="recepientref" v-model="datamaster.recepientref" type="text"
                            class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full"
                            disabled />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="costref">Cost Center</label>
                        <input id="costref" v-model="datamaster.costref" type="text"
                            class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full"
                            disabled />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="orderref">Order</label>
                        <input id="orderref" type="text" v-model="datamaster.orderref"
                            class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full"
                            disabled />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="recslocref">Receiving Storage Location</label>
                        <input id="recslocref" v-model="datamaster.recslocref" type="text"
                            class="text-base text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full"
                            disabled />
                    </div>
                </div>

                <!-- <pre>{{datamastersref}}</pre>  -->
                <DataTable ref="dt" :value="datamastersref" dataKey="id" class="p-datatable-gridlines"
                    responsiveLayout="scroll">
                    <Column field="code" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material.code }}
                        </template>
                    </Column>
                    <Column field="mat_description" headerStyle="width:25%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Material Desciption</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material.desc }}
                        </template>
                    </Column>
                    <Column field="Plant" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Plant</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material.plant.name }}
                        </template>
                    </Column>
                    <Column field="qty" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Qty</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.qty }}
                        </template>
                    </Column>
                    <Column field="uom" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">UoM</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material.uom.name }}
                        </template>
                    </Column>
                    <Column field="date" headerStyle="width:25%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Requirement Date</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.requirement_date }}
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
                        <select id="mvt_type" v-model="datamaster2.mvt_type"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted2 && !datamaster2.mvt_type }" style="appearance: auto">
                            <option v-for="mvt in mvts" :key="mvt.id" :value="mvt.id">{{ mvt.code }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted2 && !datamaster2.mvt_type">Movement Type is
                            required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="sloc" class="mr-1">Storage Location</label>
                            <p style="color: red">*</p>
                        </div>
                        <select id="sloc" v-model="datamaster2.sloc"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted2 && !datamaster2.sloc }" style="appearance: auto">
                            <option v-for="loc in s_locs" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted2 && !datamaster2.sloc">Storage Location is
                            required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="good_recepient" class="mr-1">Good Recipient</label>
                            <p style="color: red">*</p>
                        </div>
                        <select id="good_recepient" v-model="datamaster2.good_recepient"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted2 && !datamaster2.good_recepient }"
                            style="appearance: auto">
                            <option v-for="rec in recipients" :key="rec.id" :value="rec.id">{{ rec.code }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted2 && !datamaster2.good_recepient">Good
                            Recipient
                            is required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="cost_center" class="mr-1">Cost Center</label>
                            <p style="color: red">*</p>
                        </div>
                        <select id="cost_center" v-model="datamaster2.cost_center"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted2 && !datamaster2.cost_center }"
                            style="appearance: auto">
                            <option v-for="cc in ccs" :key="cc.id" :value="cc.id">{{ cc.name }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted2 && !datamaster2.cost_center">Cost Center is
                            required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="order">Order</label>
                        <input v-model.trim="datamaster2.order" type="text"
                            class="text-base surface-overlay text-color p-2 border-1 border-solid border-round appearance-none outline-none focus:border-primary w-full" />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <div class="flex">
                            <label for="rec_sloc" class="mr-1">Receiving Storage Location</label>
                            <p style="color: red">*</p>
                        </div>
                        <select id="rec_sloc" v-model="datamaster2.rec_sloc"
                            class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                            :class="{ 'border-red-500': submitted2 && !datamaster2.rec_sloc }" style="appearance: auto">
                            <option v-for="loc in s_locs" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                        </select>
                        <small class="p-invalid text-red-500" v-if="submitted2 && !datamaster2.rec_sloc">Storage Location
                            is
                            required.</small>
                    </div>
                </div>

                <!-- <pre>{{ datamasters }}</pre> -->
                <DataTable :value="datamasters" dataKey="id" class="p-datatable-gridlines" responsiveLayout="scroll">
                    <Column field="code" headerStyle="min-width:160px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <select id="code" v-model="slotProps.data.code"
                                @change="updateMaterialInfo(slotProps.data.code)"
                                class="w-full text-base text-color surface-overlay p-2 border-1 border-solid border-round outline-none focus:border-primary"
                                style="appearance: auto">
                                <option v-for="matloc in matlocs" :key="matloc.id" :value="matloc.id">{{ matloc.code }}</option>
                            </select>
                        </template>
                    </Column>
                    <Column field="mat_desc" headerStyle="min-width:220px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Description</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full bg-dark" v-model="slotProps.data.mat_desc" disabled />
                        </template>
                    </Column>
                    <Column field="item" headerStyle="min-width:100px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Item</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full" v-model="slotProps.data.item" />
                        </template>
                    </Column>
                    <Column field="plant" headerStyle="min-width:100px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Plant</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full bg-dark" v-model="slotProps.data.plant" disabled />
                        </template>
                    </Column>
                    <Column field="qty" headerStyle="min-width:100px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Qty</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full" v-model="slotProps.data.qty" />
                        </template>
                    </Column>
                    <Column field="uom_id" headerStyle="min-width:100px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">UoM</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <InputText class="w-full bg-dark" v-model="slotProps.data.uom_id" disabled />
                        </template>
                    </Column>
                    <Column field="code" headerStyle="min-width:170px;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Requirement Date</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <Calendar v-model="slotProps.data.date" class="w-full" showIcon iconDisplay="input" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:80px">
                        <template #body="slotProps">
                            <Button icon="pi pi-trash" class="border-none" style="background: white; color:red"
                                @click="() => deleteRow(slotProps.$index)" />
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
    opacity: 0.5;
    /* You can adjust the opacity value as needed */
}
</style>
