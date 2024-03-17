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
const plants = ref([]);
const search = ref(null);
const totalRecords = ref(null);
const s_locs = ref([]);

const onPage = async (event) => {
    event.page += 1;

    try {
        const apiUrl = `${apiBaseUrl}/api/master/storage_bin?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}&paginate_count=${event.rows}`;

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
        const apiUrl = `${apiBaseUrl}/api/master/storage_bin`;

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

    submitted.value = false;
    datamasterDialog.value = true;
    modalHeader.value = 'Add New Storage Bin';
};

const hideDialog = () => {
    datamasterDialog.value = false;
    submitted.value = false;
};

const updateDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_bin/${datamaster.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name,
                sloc_id: datamaster.value.s_loc.id,
                plant_id: datamaster.value.plant_id.id,
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Storage Bin Updated', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to update data Storage Bin');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
};

const createDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_bin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name,
                sloc_id: datamaster.value.s_loc.id,
                plant_id: datamaster.value.plant_id.id,
                // tambahkan field lain sesuai kebutuhan
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Storage Bin Created', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to create data Storage Bin');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
};

const searchStorageLocations = async (event) => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_location?search=${event.value}&paginate_count=15`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            s_locs.value = data.data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch storage location data from API');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch storage locations', life: 5000 });
    }
};

const saveDatamaster = () => {
    submitted.value = true;
    if (
        datamaster.value.name &&
        datamaster.value.name.trim() &&
        datamaster.value.plant_id.id !== null &&
        datamaster.value.s_loc &&
        datamaster.value.s_loc.id !== null
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

const editDatamaster = async (editDatamaster) => {
    datamaster.value = { ...editDatamaster };

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

    console.log(datamaster.value)
    const response_location2 = await fetch(`${apiBaseUrl}/api/master/storage_location?search=${datamaster.value.sloc.name}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const datastorage2 = await response_location2.json();

    if (response_location2.ok) {
        datamaster.value.s_loc = datastorage2.data.data[0];
    } else {
    }

    const selectedPlant = plants.value.find((dep) => dep.id === datamaster.value.plant_id);
    datamaster.value.plant_id = selectedPlant;

    datamasterDialog.value = true;
    modalHeader.value = 'Edit Storage Bin';
};

const confirmDeleteDatamaster = (editDatamaster) => {
    datamaster.value = editDatamaster;
    deleteDatamasterDialog.value = true;
};
const deleteDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_bin/${datamaster.value.id}`, {
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
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Storage Bin Deleted', life: 3000 });
        } else {
            if (response.status === 500 && data.error.includes('Integrity constraint violation')) {
                throw new Error('Tidak dapat hapus data ini, karena masih digunakan pada data lain');
            } else {
                throw new Error(data.error || 'Failed to delete Storage Bin');
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
                            <h5 class="m-0">Master Storage Bin</h5>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button v-if="hasCreateMasterPermission" label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" @click="openNew" />
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
                    <Column field="name" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Storage Bin</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="sloc.name" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Storage Location</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.sloc.name }}
                        </template>
                    </Column>
                    <Column field="sloc.desc" headerStyle="width:25%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Storage Location Desc</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.sloc.desc }}
                        </template>
                    </Column>
                    <Column field="plant.name" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Plant</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.plant.name }}
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
                            <label for="name" class="mb-3">Storage Bin</label>
                            <InputText id="name" v-model.trim="datamaster.name" required="true" autofocus :class="{ 'p-invalid': submitted && !datamaster.name }" />
                            <small class="p-invalid" v-if="submitted && !datamaster.name">Storage bin is required.</small>
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
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
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="s_loc" class="mb-3">Storage Location</label>
                            <Dropdown
                                id="s_loc"
                                v-model="datamaster.s_loc"
                                :options="s_locs"
                                optionLabel="name"
                                placeholder="Select storage location"
                                :class="{ 'p-invalid': submitted && !datamaster.s_loc }"
                                required="true"
                                @filter="searchStorageLocations"
                                filter
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
                            <small class="p-invalid" v-if="submitted && !datamaster.s_loc">Storage Location is required.</small>
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
