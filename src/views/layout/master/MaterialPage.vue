<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useStore } from 'vuex';

const store = useStore();
const permission_user = ref(null);
const toast = useToast();

const hasCreateMasterPermission = ref(null);
const hasEditMasterPermission = ref(null);
const hasDeleteMasterPermission = ref(null);

const datamasters = ref([]);
const modalHeader = ref('');
const datamasterDialog = ref(false);
const deleteDatamasterDialog = ref(false);
const datamaster = ref({});
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const totalRecords = ref(null);
const search = ref(null);
const uoms = ref([]);
const plants = ref([]);

const batch = ref([
    { label: 'Ya', value: 1 },
    { label: 'Tidak', value: 0 }
]);


const onPage = async (event) => {
    event.page += 1;

    try {
        const apiUrl = `${apiBaseUrl}/api/master/material?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}&paginate_count=${event.rows}`;

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
            datamasters.value = data.data;
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
    onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });
};

onBeforeMount(() => {
    const storePermission = store.state.permission;

    if (storePermission !== null) {
        permission_user.value = storePermission;
        hasCreateMasterPermission.value = permission_user.value.some(perm => perm.name === 'create-master');
        hasEditMasterPermission.value = permission_user.value.some(perm => perm.name === 'edit-master');
        hasDeleteMasterPermission.value = permission_user.value.some(perm => perm.name === 'delete-master');
    } else {
        // Tunggu hingga nilai diupdate oleh fetch di AppLayout
        store.watch(
            (state) => state.permission,
            (newVal) => {       
                permission_user.value = newVal;
                hasCreateMasterPermission.value = permission_user.value.some(perm => perm.name === 'create-master');
                hasEditMasterPermission.value = permission_user.value.some(perm => perm.name === 'edit-master');
                hasDeleteMasterPermission.value = permission_user.value.some(perm => perm.name === 'delete-master');
            }
        );
    }
    initFilters();
});

onMounted(async () => {
    try {
        //get url by departement
        const apiUrl = `${apiBaseUrl}/api/master/material`;

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
            totalRecords.value = data.data.total;
        } else {
            throw new Error(data.error || 'Failed to fetch data from API');
        }

          // Ambil data plant dari Laravel API
          const responsePlant = await fetch(`${apiBaseUrl}/api/master/plant`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const dataPlant = await responsePlant.json();
       
        if (responsePlant.ok) {
            plants.value = dataPlant.data.data;
        } else {
            throw new Error(dataPlant.error || 'Failed to fetch plant data from API');
        }

    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const openNew = async() => {
    datamaster.value = {};

    const responseUom = await fetch(`${apiBaseUrl}/api/master/uom`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const datauom = await responseUom.json();

    if (responseUom.ok) {
        uoms.value = datauom.data.data;
    } else {
        throw new Error(datauom.error || 'Failed to fetch uom data from API');
    }

    submitted.value = false;
    datamasterDialog.value = true;
    modalHeader.value = 'Add New Material';
};

const hideDialog = () => {
    datamasterDialog.value = false;
    submitted.value = false;
};

const updateDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/material/${datamaster.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                code: datamaster.value.code,
                desc: datamaster.value.desc,
                uom_id: datamaster.value.uom_id.id,
                is_batch: datamaster.value.batch.value,
                plant_id: datamaster.value.plant_id.id
                // tambahkan field lain sesuai kebutuhan
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Material Updated', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to update data Material');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
};

const createDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/material`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                code: datamaster.value.code,
                desc: datamaster.value.desc,
                uom_id: datamaster.value.uom_id.id,
                is_batch: datamaster.value.batch.value,
                plant_id: datamaster.value.plant_id.id
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Material Created', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to create data Material');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
};

const saveDatamaster = () => {
    submitted.value = true;
    if (
        datamaster.value.code &&
        datamaster.value.code.trim() &&
        datamaster.value.desc &&
        datamaster.value.desc.trim() &&
        datamaster.value.plant_id.id !== null &&
        datamaster.value.batch &&
        datamaster.value.batch.value !== null &&
        datamaster.value.uom_id &&
        datamaster.value.uom_id.id !== null
    ) {
        if (datamaster.value.id) {
            updateDatamaster();
        } else {
            createDatamaster();
        }
        datamasterDialog.value = false;
        datamaster.value = {};
    }
};

const searchUoms = async (event) => {    
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/uom?search=${event.value}&paginate_count=15`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            uoms.value = data.data.data;            
        } else {
            throw new Error(data.error || 'Failed to fetch storage location data from API');
        }
    } catch (error) {        
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch storage locations', life: 5000 });
    }
};

const editDatamaster = async (editDatamaster) => {
    datamaster.value = { ...editDatamaster };    

    // Ambil data UOM dari Laravel API
    const responseUom = await fetch(`${apiBaseUrl}/api/master/uom`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const datauom = await responseUom.json();

    if (responseUom.ok) {
        uoms.value = datauom.data.data;
    } else {
        throw new Error(datauom.error || 'Failed to fetch uom data from API');
    }

    const response_uoms2 = await fetch(`${apiBaseUrl}/api/master/uom?search=${datamaster.value.uom.name}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const datauom2 = await response_uoms2.json();
    
    if (response_uoms2.ok) {
        datamaster.value.uom_id = datauom2.data.data[0];
        console.log(datamaster.value.uom_id)   
    } else {
    }

    const selectedPlant = plants.value.find((dep) => dep.id === datamaster.value.plant_id);
    datamaster.value.plant_id = selectedPlant;

    const selectedBatch = batch.value.find((b) => b.value === datamaster.value.is_batch);
    datamaster.value.batch = selectedBatch;

    datamasterDialog.value = true;
    modalHeader.value = 'Edit Material';
};

const confirmDeleteDatamaster = (editDatamaster) => {
    datamaster.value = editDatamaster;
    deleteDatamasterDialog.value = true;
};

const deleteDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/material/${datamaster.value.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            // Memuat ulang data setelah penghapusan berhasil
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            deleteDatamasterDialog.value = false;
            datamaster.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Material Deleted', life: 3000 });
        } else {
            if (response.status === 500 && data.error.includes('Integrity constraint violation')) {
                throw new Error('Tidak dapat hapus data ini, karena masih digunakan pada data lain');
            } else {
                throw new Error(data.error || 'Failed to delete Material');
            }
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 });
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
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
                            <h5 class="m-0">Master Material</h5>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button v-if="hasCreateMasterPermission" label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" @click="openNew" />
                    </template>
                </Toolbar>

                <!-- <pre>{{ datamasters }}</pre> -->

                <DataTable
                    ref="dt"
                    :value="datamasters.data"
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
                        </div>
                    </template>
                    <Column field="rowIndex" headerStyle="min-width:5%;" style="text-align: center">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 100%">
                                <span style="width: 100%">No</span>
                            </div>
                        </template>
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column field="code" headerStyle="width:25%; min-width:10rem;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column field="desc" headerStyle="width:30%; min-width:10rem;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Material Description</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.desc }}
                        </template>
                    </Column>
                    <Column field="uom" headerStyle="width:10%; min-width:10rem;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">UOM</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.uom.name }}
                        </template>
                    </Column>
                    <Column field="batch" headerStyle="width:10%; min-width:10rem;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Batch</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.batch === 1 ? 'Ya' : 'Tidak' }}
                        </template>
                    </Column>
                    <Column field="plant" headerStyle="width:10%; min-width:10rem;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Plant</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.plant.name }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;" style="text-align: center">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 100%">
                                <span style="width: 100%">Action</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <Button v-if="hasEditMasterPermission" icon="pi pi-file-edit" class="p-button-text p-button-primary mt-2" @click="editDatamaster(slotProps.data)" />
                            <Button v-if="hasDeleteMasterPermission" icon="pi pi-trash" class="p-button-text p-button-danger mt-2" @click="confirmDeleteDatamaster(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="datamasterDialog" :style="{ width: '750px' }" :header="modalHeader" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="code">Material Code</label>
                        <InputText id="code" v-model.trim="datamaster.code" required="true" autofocus :class="{ 'p-invalid': submitted && !datamaster.code }" />
                        <small class="p-invalid" v-if="submitted && !datamaster.code">Material code is required.</small>
                    </div>

                    <div class="field">
                        <label for="desc">Material Description</label>
                        <InputText id="desc" v-model.trim="datamaster.desc" required="true" autofocus :class="{ 'p-invalid': submitted && !datamaster.desc }" />
                        <small class="p-invalid" v-if="submitted && !datamaster.desc">Material description is required.</small>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="uom_id" class="mb-3">UoM</label>
                            <Dropdown id="uom_id" v-model="datamaster.uom_id" :options="uoms" optionLabel="name" placeholder="Select a uom" :class="{ 'p-invalid': submitted && !datamaster.uom_id }" required="true" @filter="searchUoms" filter>
                                <template #value="slotProps">
                                    <div v-if="slotProps.value && slotProps.value.id">
                                        {{ slotProps.value.name }}
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                            </Dropdown>
                            <small class="p-invalid" v-if="submitted && !datamaster.uom_id">UoM is required.</small>
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="batch" class="mb-3">Use Batch ?</label>
                            <Dropdown id="batch" v-model="datamaster.batch" :options="batch" optionLabel="label" placeholder="Select a batch" :class="{ 'p-invalid': submitted && !datamaster.batch }" required="true">
                                <template #value="slotProps">
                                    <div v-if="slotProps.value && slotProps.value.value">
                                        <span :class="'product-badge status-' + slotProps.value.value">{{ slotProps.value.label }}</span>
                                    </div>
                                    <div v-else-if="slotProps.value && !slotProps.value.value">
                                        <span :class="'product-badge status-' + slotProps.value.label.toLowerCase()">{{ slotProps.value.label }}</span>
                                    </div>

                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                            </Dropdown>
                            <small class="p-invalid" v-if="submitted && !datamaster.batch">Select batch status is required.</small>
                        </div>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="plant_id" class="mb-3">Plant</label>
                            <Dropdown id="plant" v-model="datamaster.plant_id" :options="plants" optionLabel="name" placeholder="Select a plant" :class="{ 'p-invalid': submitted && !datamaster.plant_id }" required="true">
                                <template #value="slotProps">
                                    <div v-if="slotProps.value && slotProps.value.id">
                                        {{ slotProps.value.name }}
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                            </Dropdown>
                            <small class="p-invalid" v-if="submitted && !datamaster.plant_id">Plant is required.</small>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" @click="hideDialog" :style="{ background: 'white', color: 'blue' }" />
                        <Button label="Save" icon="pi pi-check" class="p-button-primary" @click="saveDatamaster" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteDatamasterDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="datamaster"
                            >Are you sure you want to delete <b>{{ datamaster.material_code }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" :style="{ background: 'white', color: 'red', borderColor: 'red' }" @click="deleteDatamasterDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-primary" @click="deleteDatamaster" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
</style>
