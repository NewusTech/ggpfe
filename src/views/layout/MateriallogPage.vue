<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useStore } from 'vuex';

const store = useStore();
const permission_user = ref(null);
const toast = useToast();

const hasCreateMaterialLocationPermission = ref(null);
const hasEditMaterialLocationPermission = ref(null);
const hasDeleteMaterialLocationPermission = ref(null);

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
const s_bins = ref([]);
const s_locs = ref([]);
const material_masters = ref([]);

const onPage = async (event) => {
    event.page += 1;

    try {
        const apiUrl = `${apiBaseUrl}/api/material_location?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}&paginate_count=${event.rows}`;

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
        hasCreateMaterialLocationPermission.value = permission_user.value.some(perm => perm.name === 'create-material-location');
        hasEditMaterialLocationPermission.value = permission_user.value.some(perm => perm.name === 'edit-material-location');
        hasDeleteMaterialLocationPermission.value = permission_user.value.some(perm => perm.name === 'delete-material-location');
    } else {
        // Tunggu hingga nilai diupdate oleh fetch di AppLayout
        store.watch(
            (state) => state.permission,
            (newVal) => {       
                permission_user.value = newVal;
                hasCreateMaterialLocationPermission.value = permission_user.value.some(perm => perm.name === 'create-material-location');
                hasEditMaterialLocationPermission.value = permission_user.value.some(perm => perm.name === 'edit-material-location');
                hasDeleteMaterialLocationPermission.value = permission_user.value.some(perm => perm.name === 'delete-material-location');
            }
        );
    }

    initFilters();
});

onMounted(async () => {
    try {
        const apiUrl = `${apiBaseUrl}/api/material_location`;

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
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const openNew = async () => {
    datamaster.value = {};

    // Ambil data dari Laravel API
    const response_bin = await fetch(`${apiBaseUrl}/api/master/storage_bin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const databin = await response_bin.json();

    if (response_bin.ok) {
        s_bins.value = databin.data.data;
    } else {
        throw new Error(databin.error || 'Failed to fetch storage bin data from API');
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

    // Ambil data dari Laravel API
    const response_material_masters = await fetch(`${apiBaseUrl}/api/master/material`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const datamaterial_masters = await response_material_masters.json();

    if (response_material_masters.ok) {
        material_masters.value = datamaterial_masters.data.data;
    } else {
        throw new Error(datamaterial_masters.error || 'Failed to fetch material code data from API');
    }

    submitted.value = false;
    datamasterDialog.value = true;
    modalHeader.value = 'Add New Material Location Default';
};

const hideDialog = () => {
    datamasterDialog.value = false;
    submitted.value = false;
};

const updateDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/material_location/${datamaster.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                sbin_id: datamaster.value.s_bin.id,
                material_id: datamaster.value.code.id
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Material Location Default Updated', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to update data Material Location Default');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 });
    }
};

const createDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/material_location`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                sbin_id: datamaster.value.s_bin.id,
                material_id: datamaster.value.code.id
                // tambahkan field lain sesuai kebutuhan
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Material Location Default Created', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to create data Material Location Default');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 });
    }
};

const saveDatamaster = () => {
    submitted.value = true;
    if (datamaster.value.s_bin && datamaster.value.s_bin.id !== null && datamaster.value.code && datamaster.value.code.id !== null) {
        if (datamaster.value.id) {
            updateDatamaster();
        } else {
            createDatamaster();
        }
        datamasterDialog.value = false;
        datamaster.value = {};
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

const searchMaterial = async (event) => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/material?search=${event.value}&paginate_count=15`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            material_masters.value = data.data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch storage location data from API');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch storage locations', life: 5000 });
    }
};

const searchStorageBin = async (event) => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_bin?search=${event.value}&paginate_count=15`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            s_bins.value = data.data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch storage bin data from API');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch storage bins', life: 5000 });
    }
};

const editDatamaster = async (editDatamaster) => {
    datamaster.value = { ...editDatamaster };

    // Ambil data dari Laravel API
    const response_bin = await fetch(`${apiBaseUrl}/api/master/storage_bin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const databin = await response_bin.json();

    if (response_bin.ok) {
        s_bins.value = databin.data.data;
    } else {
        throw new Error(databin.error || 'Failed to fetch storage bin data from API');
    }

    // Ambil data dari Laravel API
    const response_bin2 = await fetch(`${apiBaseUrl}/api/master/storage_bin?search=${datamaster.value.sbin.name}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const databin2 = await response_bin2.json();

    if (response_bin2.ok) {
        datamaster.value.s_bin = databin2.data.data[0];
    } else {
        throw new Error(databin2.error || 'Failed to fetch storage bin data from API');
    }

    // Ambil data dari Laravel API
    const response_material_masters = await fetch(`${apiBaseUrl}/api/master/material`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const datamaterial_masters = await response_material_masters.json();

    if (response_material_masters.ok) {
        material_masters.value = datamaterial_masters.data.data;
    } else {
        throw new Error(datamaterial_masters.error || 'Failed to fetch material code data from API');
    }

    const response_material_masters2 = await fetch(`${apiBaseUrl}/api/master/material?search=${datamaster.value.material.code}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const datamaterial_masters2 = await response_material_masters2.json();

    if (response_material_masters2.ok) {
        datamaster.value.code = datamaterial_masters2.data.data[0];
    } else {
        throw new Error(datamaterial_masters2.error || 'Failed to fetch material code data from API');
    }

    datamasterDialog.value = true;
    modalHeader.value = 'Edit Material Location Default';
};

const confirmDeleteDatamaster = (editDatamaster) => {
    datamaster.value = editDatamaster;
    deleteDatamasterDialog.value = true;
};

const updateInfo = (selectedMaterialCode) => {
    const selectedMaterial = material_masters.value.find(material_code => material_code.code === selectedMaterialCode);

    if (selectedMaterial) {
        datamaster.value.material_desc = selectedMaterial.desc;
        datamaster.value.plant = selectedMaterial.plant.name;
        datamaster.value.uom = selectedMaterial.uom.name;
        datamaster.value.material_code_fix = selectedMaterialCode;
    }
};

const updateInfo2 = async (selectedSlocCode) => {
    const selectedSloc = s_locs.value.find(sloc => sloc.name === selectedSlocCode);

    if (selectedSloc) {
        datamaster.value.sloc_desc = selectedSloc.name;

        try {
            const response = await fetch(`${apiBaseUrl}/api/master/storage_bin?s_loc=${selectedSloc.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                s_bins.value = data.data.data;
            } else {
                throw new Error(data.error || 'Failed to fetch storage bin data from API');
            }
        } catch (error) {
            console.error('Error fetching storage bin data:', error);
            // Handle error
        }
    }
};

const deleteDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/material_location/${datamaster.value.id}`, {
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
            toast.add({ severity: 'success', summary: 'Successful', detail: 'material location default Deleted', life: 3000 });
        } else {
            if (response.status === 500 && data.error.includes('Integrity constraint violation')) {
                throw new Error('Tidak dapat hapus data ini, karena masih digunakan pada data lain');
            } else {
                throw new Error(data.error || 'Failed to delete material location default');
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
                            <h5 class="m-0">Material Location Default</h5>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button v-if="hasCreateMaterialLocationPermission" label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" @click="openNew" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="datamasters.data" lazy :filters="filters" :first="first" @page="onPage($event)"
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
                        </div>
                    </template>
                    <Column field="rowIndex" headerStyle="width:5%;" style="text-align: center">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 100%">
                                <span style="width: 100%">No</span>
                            </div>
                        </template>
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column field="material_code" headerStyle="width:12%;">
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
                    <Column field="material_desc" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Material Description</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material.desc }}
                        </template>
                    </Column>
                    <Column field="uom_name" headerStyle="width:7%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">UoM</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material.uom.name }}
                        </template>
                    </Column>
                    <Column field="plant" headerStyle="width:7%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Plant</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.material.plant.name }}
                        </template>
                    </Column>
                    <Column field="sloc_name" headerStyle="width:7%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">S. Loc</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.sbin.sloc.name }}
                        </template>
                    </Column>
                    <Column field="sloc_description" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">S. Loc Description</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.sbin.sloc.desc }}
                        </template>
                    </Column>
                    <Column field="s_bin" headerStyle="width:8%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '100%' }">
                                <span style="width: 100%">S. Bin</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.sbin.name }}
                        </template>
                    </Column>
                    <Column style="text-align: center" headerStyle="width:13%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 100%">
                                <span style="width: 100%">Action</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <Button v-if="hasEditMaterialLocationPermission" icon="pi pi-file-edit" class="p-button-text p-button-primary mt-2"
                                @click="editDatamaster(slotProps.data)" />
                            <Button v-if="hasDeleteMaterialLocationPermission" icon="pi pi-trash" class="p-button-text p-button-danger mt-2"
                                @click="confirmDeleteDatamaster(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="datamasterDialog" :style="{ width: '750px' }" :header="modalHeader" :modal="true"
                    class="p-fluid">
                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="code">Material Code</label>
                            <Dropdown id="code" @change="updateInfo(datamaster.code.code)"
                                v-model="datamaster.code" :options="material_masters" optionLabel="code"
                                placeholder="Select material code"
                                :class="{ 'p-invalid': submitted && !datamaster.code }" required="true"
                                @filter="searchMaterial" filter>
                                <template #value="slotProps">
                                    <div v-if="slotProps.value && slotProps.value.id">
                                        {{ slotProps.value.code }}
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                            </Dropdown>
                            <small class="p-invalid" v-if="submitted && !datamaster.code">Material code is
                                required.</small>
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="material_desc">Material Description</label>
                            <InputText id="material_desc" v-model.trim="datamaster.material_desc" disabled />
                        </div>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="uom">UoM</label>
                            <InputText id="uom" v-model.trim="datamaster.uom" disabled />
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="plant">Plant</label>
                            <InputText id="plant" v-model="datamaster.plant" disabled />
                        </div>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%;">
                            <label for="s_loc">Storage Location</label>
                            <Dropdown id="s_loc" v-model="datamaster.s_loc" :options="s_locs" optionLabel="name"
                                placeholder="Select storage location" @filter="searchStorageLocations" filter
                                @change="updateInfo2(datamaster.s_loc.name)">
                                <template #value="slotProps">
                                    <div v-if="slotProps.value && slotProps.value.id">
                                        {{ slotProps.value.name }}
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                            </Dropdown>
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="sloc_desc">Storage Location Description</label>
                            <InputText id="sloc_desc" v-model.trim="datamaster.sloc_desc" disabled />
                        </div>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%;">
                            <label for="s_bin">Storage Bin</label>
                            <Dropdown id="s_bin" v-model="datamaster.s_bin" :options="s_bins" optionLabel="name"
                                placeholder="Select storage bin" :class="{ 'p-invalid': submitted && !datamaster.s_bin }"
                                required="true" @filter="searchStorageBin" filter>
                                <template #value="slotProps">
                                    <div v-if="slotProps.value && slotProps.value.id">
                                        {{ slotProps.value.name }}
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                            </Dropdown>
                            <small class="p-invalid" v-if="submitted && !datamaster.s_bin">Storage Bin is required.</small>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" @click="hideDialog"
                            :style="{ background: 'white', color: 'blue' }" />
                        <Button label="Save" icon="pi pi-check" class="p-button-primary" @click="saveDatamaster" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteDatamasterDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="datamaster">Are you sure you want to delete <b>{{ datamaster.s_bin }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times"
                            :style="{ background: 'white', color: 'red', borderColor: 'red' }"
                            @click="deleteDatamasterDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-primary" @click="deleteDatamaster" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
