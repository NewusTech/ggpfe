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
const search = ref(null);
const totalRecords = ref(null);
const departments = ref([]);
const plants = ref([]);

const is_batch = ref([
    { label: 'Ya', value: 1 },
    { label: 'Tidak', value: 0 }
]);

const is_inbound_release = ref([
    { label: 'Ya', value: 1 },
    { label: 'Tidak', value: 0 }
]);

const is_outbound_release = ref([
    { label: 'Ya', value: 1 },
    { label: 'Tidak', value: 0 }
]);

const onPage = async (event) => {
// 
    event.page += 1;

    try {
        const apiUrl = `${apiBaseUrl}/api/master/storage_location?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}&paginate_count=${event.rows}`;        
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
    // 
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
        //get url by department
        const apiUrl =`${apiBaseUrl}/api/master/storage_location`;

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

        // Ambil data departemen dari Laravel API
        const responseDepartment = await fetch(`${apiBaseUrl}/api/master/department`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const dataDepartment = await responseDepartment.json();

        if (responseDepartment.ok) {
            departments.value = dataDepartment.data.data;
        } else {
            throw new Error(dataDepartment.error || 'Failed to fetch department data from API');
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

const openNew = () => {
    datamaster.value = {};
    submitted.value = false;
    datamasterDialog.value = true;
    modalHeader.value = 'Add New Storage Location';
};

const hideDialog = () => {
    datamasterDialog.value = false;
    submitted.value = false;
};

const updateDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_location/${datamaster.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name,
                desc: datamaster.value.desc,
                department_id: datamaster.value.department.id,
                is_batch: datamaster.value.is_batch.value,
                plant_id: datamaster.value.plant_id.id,
                is_inbound_release: datamaster.value.is_inbound_release.value,
                is_outbound_release: datamaster.value.is_outbound_release.value
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows })
          
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Storage Location Updated', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to update data Storage Location');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
};

const createDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_location`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name,
                desc: datamaster.value.desc,
                department_id: datamaster.value.department.id,
                is_batch: datamaster.value.is_batch.value,
                plant_id: datamaster.value.plant_id.id,
                is_inbound_release: datamaster.value.is_inbound_release.value,
                is_outbound_release: datamaster.value.is_outbound_release.value
                // tambahkan field lain sesuai kebutuhan
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows })

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Storage Location Created', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to create data Storage Location');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
};

const saveDatamaster = () => {
    submitted.value = true;    
    if (
        datamaster.value.name &&
        datamaster.value.name.trim() &&
        datamaster.value.desc &&
        datamaster.value.desc.trim() &&
        datamaster.value.department &&
        datamaster.value.department.id !== null &&
        datamaster.value.plant_id.id !== null &&
        datamaster.value.is_batch &&
        datamaster.value.is_batch.value !== null &&
        datamaster.value.is_outbound_release &&
        datamaster.value.is_outbound_release.value !== null &&
        datamaster.value.is_inbound_release &&
        datamaster.value.is_inbound_release.value !== null
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

const editDatamaster = (editDatamaster) => {
    datamaster.value = { ...editDatamaster };

    const selectedDepartment = departments.value.find((dep) => dep.id === datamaster.value.department_id);
    datamaster.value.department = selectedDepartment;

    const selectedPlant = plants.value.find((dep) => dep.id === datamaster.value.plant_id);
    datamaster.value.plant_id = selectedPlant;

    const selectedBatch = is_batch.value.find((b) => b.value === datamaster.value.is_batch);
    datamaster.value.is_batch = selectedBatch;

    const selectedOutbound = is_outbound_release.value.find((b) => b.value === datamaster.value.is_outbound_release);
    datamaster.value.is_outbound_release = selectedOutbound;

    const selectedInbound = is_inbound_release.value.find((b) => b.value === datamaster.value.is_inbound_release);
    datamaster.value.is_inbound_release = selectedInbound;

    datamasterDialog.value = true;
    modalHeader.value = 'Edit Storage Location';
};

const confirmDeleteDatamaster = (editDatamaster) => {
    datamaster.value = editDatamaster;
    deleteDatamasterDialog.value = true;
};

const deleteDatamaster = async () => {
// 
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_location/${datamaster.value.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            // Memuat ulang data setelah penghapusan berhasil
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows })

            deleteDatamasterDialog.value = false;
            datamaster.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Storage Location Deleted', life: 3000 });
        } else {
            if (response.status === 500 && data.error.includes('Integrity constraint violation')) {
                throw new Error('Tidak dapat hapus data ini, karena masih digunakan pada data lain');
            } else {
                throw new Error(data.error || 'Failed to delete Storage Location');
            }
        }
    } catch (error) {
        // console.error('Error deleting Storage Location:', error);
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
                            <h5 class="m-0">Master Storage Location</h5>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button v-if="hasCreateMasterPermission"  label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" @click="openNew" />
                    </template>
                </Toolbar>

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
                    <Column field="name" headerStyle="width:19%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Storage Location</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="desc" headerStyle="width:19%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Description</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.desc }}
                        </template>
                    </Column>
                    <Column field="plant" headerStyle="width:8%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Plant</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.plant.name }}
                        </template>
                    </Column>
                    <Column field="is_inbound_release" headerStyle="width:7%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Inbound</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.is_inbound_release === 1 ? 'Ya' : 'Tidak' }}
                        </template>
                    </Column>
                    <Column field="is_outbound_release" headerStyle="width:7%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Outbound</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.is_outbound_release === 1 ? 'Ya' : 'Tidak' }}
                        </template>
                    </Column>
                    <Column field="is_batch" headerStyle="width:7%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Batch</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.is_batch === 1 ? 'Ya' : 'Tidak' }}
                        </template>
                    </Column>
                    <Column field="department" headerStyle="width:13%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Department</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.department?.name }}
                        </template>
                    </Column>
                    <Column style="text-align: center" headerStyle="width:15%;">
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
                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="name">Storage Location</label>
                            <InputText id="name" v-model.trim="datamaster.name" required="true" autofocus :class="{ 'p-invalid': submitted && !datamaster.name }" />
                            <small class="p-invalid" v-if="submitted && !datamaster.name">Storage Location is required.</small>
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="desc">Description</label>
                            <InputText id="desc" v-model.trim="datamaster.desc" required="true" autofocus :class="{ 'p-invalid': submitted && !datamaster.desc }" />
                            <small class="p-invalid" v-if="submitted && !datamaster.desc">Description is required.</small>
                        </div>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="plant_id" class="mb-3">Plant</label>
                            <Dropdown id="plant_id" v-model="datamaster.plant_id" :options="plants" optionLabel="name" placeholder="Select a plant" :class="{ 'p-invalid': submitted && !datamaster.plant_id }" required="true">
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

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="is_batch" class="mb-3">Use Batch ?</label>
                            <Dropdown id="is_batch" v-model="datamaster.is_batch" :options="is_batch" optionLabel="label" placeholder="Select a batch" :class="{ 'p-invalid': submitted && !datamaster.is_batch }" required="true">
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
                            <small class="p-invalid" v-if="submitted && !datamaster.is_batch">Select batch status is required.</small>
                        </div>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="is_inbound_release" class="mb-3">Inbound Release</label>
                            <Dropdown id="is_inbound_release" v-model="datamaster.is_inbound_release" :options="is_inbound_release" optionLabel="label" placeholder="Select inbound" :class="{ 'p-invalid': submitted && !datamaster.is_inbound_release }" required="true">
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
                            <small class="p-invalid" v-if="submitted && !datamaster.is_inbound_release">Select Inbound status is required.</small>
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="is_outbound_release" class="mb-3">Outbound Release</label>
                            <Dropdown id="is_outbound_release" v-model="datamaster.is_outbound_release" :options="is_outbound_release" optionLabel="label" placeholder="Select a outbound" :class="{ 'p-invalid': submitted && !datamaster.is_outbound_release }" required="true">
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
                            <small class="p-invalid" v-if="submitted && !datamaster.is_outbound_release">Select Outbound status is required.</small>
                        </div>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="department" class="mb-3">Department</label>
                            <Dropdown
                                id="department"
                                v-model="datamaster.department"
                                :options="departments"
                                optionLabel="name"
                                placeholder="Select a Department"
                                :class="{ 'p-invalid': submitted && !datamaster.department }"
                                required="true"
                            >
                                <template #value="slotProps">
                                    <div v-if="slotProps.value && slotProps.value.id">
                                        {{ slotProps.value.name }}
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                            </Dropdown>
                            <small class="p-invalid" v-if="submitted && !datamaster.department">Department is required.</small>
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
                            >Are you sure you want to delete <b>{{ datamaster.name }}</b
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
