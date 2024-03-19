<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useStore } from 'vuex';
import ProductService from '@/service/ProductService';

const store = useStore();
const permission_user = ref(null);
const hasReleaseSAPPermission = ref(null);

const products = ref(null);
const productService = new ProductService();

const modalHeader = ref('');
const toast = useToast();
const datamasters = ref([]);
const dt = ref(null);
const filters = ref({});
const totalRecords = ref(null);
const search = ref(null);
const s_locs = ref([]);
const ReleaseDialog = ref(false);
const selectedProduct = ref();
const selectedProduct2 = ref();
const expandedRows = ref([]);
const datarelease = ref ({});

const getSelect = () => {
    const childs = selectedProduct.value.map((v) => v.materials).flat();
    selectedProduct2.value = [...childs];
};

watch(
    () => selectedProduct.value,
    () => {
        getSelect();
    }
);

const onPage = async (event) => {
    event.page += 1;

    try {
        const apiUrl = `${apiBaseUrl}/api/inbound?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}`;

        const response = await fetch(apiUrl, {
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
        console.error('Error fetching data from API:', error);
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

onBeforeMount(() => {
    productService.getProductsWithOrdersSmall().then((data) => (products.value = data));
    const storePermission = store.state.permission;

    if (storePermission !== null) {
        permission_user.value = storePermission;
        hasReleaseSAPPermission.value = permission_user.value.some(perm => perm.name === 'release-inbound');
    } else {
        // Tunggu hingga nilai diupdate oleh fetch di AppLayout
        store.watch(
            (state) => state.permission,
            (newVal) => {       
                permission_user.value = newVal;
                hasReleaseSAPPermission.value = permission_user.value.some(perm => perm.name === 'release-inbound');
            }
        );
    }
    initFilters();
});

const formatDate = (dateTimeString) => {
    if(dateTimeString){
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
    }else{
        return '-';
    }
};

onMounted(async () => {
    try {
       const apiUrl = `${apiBaseUrl}/api/inbound`;

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
        } else {
            throw new Error(datastorage.error || 'Failed to fetch storage location data from API');
        }
    } catch (error) {
        console.error('Error fetching data from API:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const openRelease = async() => {
    datarelease.value = datamasters.value.filter(item => item.status === 1)
        .map(item => ({
            ...item,
            materials: item.materials.filter(material => material.status === 2)
        }));

    ReleaseDialog.value = true;
    modalHeader.value = 'Release to SAP';
};

const hideDialog = () => {
    ReleaseDialog.value = false;
    // submitted.value = false;
};

const releaseToSAP = async () => {
    try {
        const selectedIds = selectedProduct2.value.map(item => item.id);
        console.log('kamop', selectedIds)
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
            ReleaseDialog.value = false;
            selectedProduct.value = [];
            selectedProduct2.value = [];
            onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder });
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
   <div class="grid mt-1">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-2">
                            <h5 class="m-0">Inbound</h5>
                        </div>
                    </template>
                </Toolbar>

                <!-- <pre>{{ datamasters }}</pre> -->
                
                <DataTable           
                    ref="dt"
                    :value="datamasters"
                    lazy
                    :filters="filters"
                    :first="first"
                    @page="onPage($event)"
                    :last="totalRecords"
                    :loading="loading"
                    :totalRecords="totalRecords"
                    dataKey="id"
                    class="p-datatable-gridlines"
                    :paginator="true"
                    @sort="onPage($event)"
                    :rows="10"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} datamaster"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." @input="onSearch($event)" />
                            </span>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <Button v-if="hasReleaseSAPPermission" label="Realese to SAP" class="p-button-primary mr-2" @click="openRelease" />
                            </span>
                        </div>
                    </template>
                    <Column field="rowIndex" headerStyle="width:5%;" style="text-align: center">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 100%">
                                <span style="width: 100%">No</span>
                            </div>
                        </template>
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column field="code" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <router-link :to="'/inbound/' + slotProps.data.id" class="text-primary">{{ slotProps.data.code }}</router-link>
                        </template>
                    </Column>
                    <Column field="date" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Date</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.date) }}
                        </template>
                    </Column>
                    <Column field="reference_type" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Reference Type</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{  slotProps.data.ref_type }}
                        </template>
                    </Column>
                    <Column field="from_name" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Vendor</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.from }}
                        </template>
                    </Column>
                    <Column field="s_loc" headerStyle="width:18%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Storage Location</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.s_loc }}
                        </template>
                    </Column>
                    <Column style="text-align: center" field="status" headerStyle="width:17%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 100%">
                                <span style="width: 100%">Status</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <p class="text-primary">{{ slotProps.data.status === 1 ? 'Complete' : 'On Progress' }}</p>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="ReleaseDialog" :style="{ width: '90%' }" :header="modalHeader" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="material_code">Choose your data to release</label>
                    </div>

                    <DataTable v-model:selection="selectedProduct" :value="datarelease" v-model:expandedRows="expandedRows" dataKey="id" responsiveLayout="scroll">
                        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                        <Column field="code" header="Code">
                            <template #body="slotProps">
                                {{ slotProps.data.code }}
                            </template>
                        </Column>
                        <Column field="date" header="Date">
                            <template #body="slotProps">
                                {{ slotProps.data.date }}
                            </template>
                        </Column>
                        <Column field="ref_type" header="Reference Type">
                            <template #body="slotProps">
                                {{ slotProps.data.ref_type }}
                            </template></Column
                        >
                        <Column field="from" header="from">
                            <template #body="slotProps">
                                {{ slotProps.data.from }}
                            </template>
                        </Column>
                        <Column field="s_loc" header="Storage Location">
                            <template #body="slotProps">
                                {{ slotProps.data.s_loc }}
                            </template>\
                        </Column>
                        <Column field="status" header="Status">
                            <template #body="slotProps">
                                {{ slotProps.data.status === 1 ? "Completed" : "On Progress" }}
                            </template>
                        </Column>
                        <Column header="Action" :expander="true" headerStyle="min-width: 3rem" />
                        <template #expansion="slotProps">
                            <div class="p-1">
                                <DataTable v-model:selection="selectedProduct2" :value="slotProps.data.materials" responsiveLayout="scroll" v-if="slotProps.data.materials.length">
                                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                    <Column field="material_code" header="Material Code">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material_code }}
                                        </template>
                                    </Column>
                                    <Column field="material_description" header="Material Desciption">
                                        <template #body="slotProps">
                                            {{ slotProps.data.material_description }}
                                        </template>
                                    </Column>
                                    <Column field="plant" header="Plant">
                                        <template #body="slotProps">
                                            {{ slotProps.data.plant }}
                                        </template>
                                    </Column>
                                    <Column field="qty" header="Qty">
                                        <template #body="slotProps">
                                            {{ slotProps.data.qty }}
                                        </template>
                                    </Column>
                                    <Column field="uom" header="UoM">
                                        <template #body="slotProps">
                                            {{ slotProps.data.uom }}
                                        </template>
                                    </Column>
                                    <Column field="date" header="Requirement Date">
                                        <template #body="slotProps">
                                            {{ slotProps.data.date }}
                                        </template>
                                    </Column>
                                </DataTable>
                                <div v-else class="text-center m-0 p-0">
                                    No materials available for this item.
                                </div>
                            </div>
                        </template>
                    </DataTable>

                    <template #footer>
                        <Button label="Cancel" @click="hideDialog" :style="{ background: 'white', color: 'blue' }" />
                        <Button label="Release" icon="pi pi-check" class="p-button-primary" @click="releaseToSAP"/>
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
</style>
