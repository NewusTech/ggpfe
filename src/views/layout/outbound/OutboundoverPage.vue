<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();

const toast = useToast();

const dataReceived = ref(null)
const department_id = ref(null);
const datamasters = ref([]);
const modalHeader = ref('');
const dt = ref(null);
const filters = ref({});
const totalRecords = ref(null);
const search = ref(null);
const first = ref(0);
const loading = ref(null);
const isKepalaBagian = ref(false);
const isAdminBagian = ref(false);
const RefDialog = ref(false);
const AproveDialog = ref(false);
const dataproval = ref({});
const dataref = ref({});

const selecteddata = ref();
const selecteddata2 = ref();
const expandedRows = ref([]);
const storerole = ref(null);

const onPage = async (event) => {
    event.page += 1;

    try {
        const response = await fetch(`${apiBaseUrl}/api/outbound/request?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        totalRecords.value = data.data.total;
        if (response.ok) {
            datamasters.value = data.data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch data from API');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
};

const onSearch = (event) => {
    if (event.target.value) {
        search.value = event.target.value;
    } else {
        search.value = '';
    }
    onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder });
};

onBeforeMount(async () => {
    storerole.value = store.state.permission;
    isKepalaBagian.value = storerole.value.some((permissions) => permissions.name === 'approve-request-outbound');
    isAdminBagian.value = storerole.value.some((permissions) => permissions.name === 'create-request-outbound');

    console.log("storeee", storerole.value, "isKepalaBagian", isKepalaBagian.value, "isAdminBagian.value", isAdminBagian.value)

    initFilters();
    dataReceived.value = router.currentRoute.value.meta ? router.currentRoute.value.meta.dataToSend.value : null;
});

const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
};

onMounted(async () => {
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
        const apiUrl = `${apiBaseUrl}/api/outbound/request`;

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
            datamasters.value = data.data.data;
            totalRecords.value = data.data.total;
        } else {
            throw new Error(data.error || 'Failed to fetch data from API');
        }

    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const openNew = async () => {
    const apiUrl = `${apiBaseUrl}/api/outbound/request/referencelist`;

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();

    if (response.ok) {
        dataref.value = data.data.data;
        console.log(dataref.value)
        dataref.value = dataref.value.filter(item => item.status !== 2)
        .map(item => ({
            ...item,
            outboundmaterialrequest: item.outboundmaterialrequest.filter(material => material.is_aprove === 0 && material.status === 0)
        }));
    } else {
    }

    RefDialog.value = true;
    modalHeader.value = 'Reference List';
};

const getSelect = () => {
    const childs = selecteddata.value.map((v) => v.outboundmaterialrequest).flat()
    selecteddata2.value = [...childs]
}

const aproveData = async () => {

    const ids = selecteddata2.value.map(item => item.id)
    try {
        const response = await fetch(`${apiBaseUrl}/api/outbound/request/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ids: ids
                // tambahkan field lain sesuai kebutuhan
            })
        });


        if (response.ok) {
            AproveDialog.value = false;
            selecteddata.value = [];
            selecteddata2.value = [];
            console.log(search.value, dt.value?.sortField,dt.value?.sortOrder)
            onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder });
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Aproved', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
}

watch(() => selecteddata.value, () => {
    // Fungsi ini akan dipanggil saat selecteddata berubah
    getSelect();
});

const openAprove = async () => {
    const apiUrl = `${apiBaseUrl}/api/outbound/request/listforapprove`;

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    const data = await response.json();

    if (response.ok) {
        dataproval.value = data.data.data;
        console.log(dataproval.value)
        dataproval.value = dataproval.value.filter(item => item.status !== 2)
        .map(item => ({
            ...item,
            outboundmaterialrequest: item.outboundmaterialrequest.filter(material => material.is_aprove === 0)
        }));
    } else {
    }

    AproveDialog.value = true;
    modalHeader.value = 'Aproval';
};

const hideDialog = () => {
    AproveDialog.value = false;
    // submitted.value = false;
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <!-- <pre>{{ datamasters }}</pre> -->
            <div class="card">
                <Toast />
                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-2">
                            <h5 class="m-0">Request Outbound</h5>
                        </div>
                    </template>
                    <template v-slot:end>
                        <div v-if="isAdminBagian" class="my-2">
                            <Button label="Reference List" :style="{ background: 'white', color: 'blue' }" class="mr-2"
                                @click="openNew" />
                            <router-link to="outbound-request/form-outbound">
                                <Button label="Add" icon="pi pi-plus-circle" class="p-button-primary" />
                            </router-link>
                        </div>
                        <div v-if="isKepalaBagian" class="my-2">
                            <Button label="Aproval" class="p-button-primary" @click="openAprove" />
                        </div>
                    </template>
                </Toolbar>

                <!-- <pre>{{ datamasters }}</pre> -->

                <DataTable ref="dt" :value="datamasters" lazy :filters="filters" :first="first" @page="onPage($event)"
                    :last="totalRecords" :loading="loading" :totalRecords="totalRecords" dataKey="id"
                    class="p-datatable-gridlines" :paginator="true" @sort="onPage($event)" :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} datamaster"
                    responsiveLayout="scroll">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..."
                                    @input="onSearch($event)" />
                            </span>
                            <!-- <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <Button label="Realese to SAP" class="p-button-primary mr-2" />
                            </span> -->
                        </div>
                    </template>
                    <Column field="rowIndex" headerStyle="min-width:5%;" style="text-align: center">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 100%">
                                <span style="width: 100%">No</span>
                            </div>
                        </template>
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column field="created_at" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Date</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.created_at) }}
                        </template>
                    </Column>
                    <Column field="code" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Request Number</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column field="ref_code" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Reference Doc</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.ref_code }}
                        </template>
                    </Column>
                    <Column field="type" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Type</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.reference_code === null ? 'Without Reference' : 'With Reference' }}
                        </template>
                    </Column>
                    <Column field="sloc" headerStyle="width:21%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Storage Location</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.sloc.name }}
                        </template>
                    </Column>
                    <Column field="mvt" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Movement Type</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.mvt.code }}
                        </template>
                    </Column>
                    <Column style="text-align: center" field="status" headerStyle="width:17%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 100%">
                                <span style="width: 100%">Status</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <p style="color: green;" v-if="slotProps.data.status === 2">Approved</p>
                            <p class="text-primary" v-else>Request</p>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="RefDialog" :style="{ width: '90%' }" :header="modalHeader" :modal="true"
                    class="p-fluid">
                    <!-- <pre>{{ dataref }}</pre> -->
                    <DataTable :value="dataref" v-model:expandedRows="expandedRows" dataKey="id"
                        responsiveLayout="scroll">
                        <Column field="ref_code" header="Reference Doc">
                            <template #body="slotProps">
                                {{ slotProps.data.ref_code }}
                            </template>
                        </Column>
                        <Column field="created_at" header="Reference Date">
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.created_at) }}
                            </template>
                        </Column>
                        <Column field="sloc" header="Storage Location">
                            <template #body="slotProps">
                                {{ slotProps.data.sloc.name }}
                            </template>
                        </Column>
                        <Column field="mvt" header="Movement Type">
                            <template #body="slotProps">
                                {{ slotProps.data.mvt.code }}
                            </template>
                        </Column>
                        <Column field="recepient" header="Good Recipient">
                            <template #body="slotProps">
                                {{ slotProps.data.recepient.code }}
                            </template>
                        </Column>
                        <Column field="costcenter" header="Cost Center">
                            <template #body="slotProps">
                                {{ slotProps.data.costcenter.name }}
                            </template>
                        </Column>
                        <Column field="order" header="Order">
                            <template #body="slotProps">
                                {{ slotProps.data.order }}
                            </template>
                        </Column>
                        <Column field="receivingsloc" header="Receiving S. Loc">
                            <template #body="slotProps">
                                {{ slotProps.data.receivingsloc.name }}
                            </template>
                        </Column>
                        <Column header="Action" :expander="true" headerStyle="min-width: 3rem" />
                        <template #expansion="slotProps">
                            <div class="p-3">
                                <DataTable :value="slotProps.data.outboundmaterialrequest" responsiveLayout="scroll">
                                    <Column field="code" header="Material Code">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material.code }}
                                        </template>
                                    </Column>
                                    <Column field="desc" header="Material Desciption">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material.desc }}
                                        </template>
                                    </Column>
                                    <Column field="plant" header="Plant">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material.plant.name }}
                                        </template>
                                    </Column>
                                    <Column field="qty" header="Qty">
                                        <template #body="slotProps">
                                            {{ slotProps.data.qty }}
                                        </template>
                                    </Column>
                                    <Column field="uom" header="UoM">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material.uom.name }}
                                        </template>
                                    </Column>
                                    <Column field="date2" header="Requirement Date">
                                        <template #body="slotProps">
                                            {{ formatDate(slotProps.data.material.created_at) }}
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </template>
                    </DataTable>
                </Dialog>

                <Dialog v-model:visible="AproveDialog" :style="{ width: '90%' }" :header="modalHeader" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="material_code">Choose your data to aprove</label>
                    </div>
                    <!-- <pre>{{ dataproval }}</pre> -->
                    <DataTable v-model:selection="selecteddata" :value="dataproval" v-model:expandedRows="expandedRows"
                        dataKey="id" responsiveLayout="scroll">
                        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                        <Column field="ref_code" header="Reference Doc">
                            <template #body="slotProps">
                                {{ slotProps.data.ref_code ? slotProps.data.ref_code : " - " }}
                            </template>
                        </Column>
                        <Column field="created_at" header="Reference Date">
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.created_at) }}
                            </template>
                        </Column>
                        <Column field="s_loc" header="Storage Location">
                            <template #body="slotProps">
                                {{ slotProps.data.sloc.name }}
                            </template>
                        </Column>
                        <Column field="mvt_code" header="Movement Type">
                            <template #body="slotProps">
                                {{ slotProps.data.mvt.code }}
                            </template>
                        </Column>
                        <Column field="recepient" header="Good Recipient">
                            <template #body="slotProps">
                                {{ slotProps.data.recepient.code }}
                            </template>
                        </Column>
                        <Column field="cost_centeer" header="Cost Center">
                            <template #body="slotProps">
                                {{ slotProps.data.costcenter.name }}
                            </template>
                        </Column>
                        <Column field="order" header="Order">
                            <template #body="slotProps">
                                {{ slotProps.data.order }}
                            </template>
                        </Column>
                        <Column field="receivingsloc" header="Receiving S. Loc">
                            <template #body="slotProps">
                                {{ slotProps.data.receivingsloc.name }}
                            </template>
                        </Column>
                        <Column header="Action" :expander="true" headerStyle="min-width: 3rem" />
                        <template #expansion="slotProps">
                            <div class="p-3">
                                <DataTable v-model:selection="selecteddata2" :value="slotProps.data.outboundmaterialrequest"
                                    responsiveLayout="scroll">
                                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                    <Column field="code" header="Material Code">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material.code }}
                                        </template>
                                    </Column>
                                    <Column field="desc" header="Material Desciption">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material.desc }}
                                        </template>
                                    </Column>
                                    <Column field="plant" header="Plant">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material.plant.name }}
                                        </template>
                                    </Column>
                                    <Column field="qty" header="Qty">
                                        <template #body="slotProps">
                                            {{ slotProps.data.qty }}
                                        </template>
                                    </Column>
                                    <Column field="qty" header="UoM">
                                        <template #body="slotProps">
                                            {{ slotProps.data.qty }}
                                        </template>
                                    </Column>
                                    <Column field="qty" header="Requirement Date">
                                        <template #body="slotProps">
                                            {{ slotProps.data.qty }}
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </template>
                    </DataTable>

                    <template #footer>
                        <Button label="Cancel" @click="hideDialog" :style="{ background: 'white', color: 'blue' }" />
                        <Button label="Aprove" @click="aproveData" class="p-button-primary" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
