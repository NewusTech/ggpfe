<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
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
const modalHeader = ref("");
const datamasterDialog = ref(false);
const deleteDatamasterDialog = ref(false);
const datamaster = ref({});
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const totalRecords = ref(null);
const search = ref(null);

const onPage = async (event) => {    
    event.page+=1;

    try {              
        const response = await fetch(`${apiBaseUrl}/api/master/department?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}&paginate_count=${event.rows}`, {
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
        // Fetch data from Laravel API
        const response = await fetch(`${apiBaseUrl}/api/master/department`, {
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

const openNew = () => {
    datamaster.value = {};
    submitted.value = false;
    datamasterDialog.value = true;
    modalHeader.value = "Add New Department";
};

const hideDialog = () => {
    datamasterDialog.value = false;
    submitted.value = false;
};

const updateDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/department/${datamaster.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name
                // tambahkan field lain sesuai kebutuhan
            })
        });
        const data = await response.json();

        if (response.ok) {
            onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });
          
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Department Updated', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to update department');
        }
    } catch (error) {        
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
};

const createDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/department`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name
                // tambahkan field lain sesuai kebutuhan
            })
        });
        const data = await response.json();

        if (response.ok) {
            onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Department Created', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to create department');
        }
    } catch (error) {        
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
};

const saveDatamaster = () => {
    submitted.value = true;
    if (datamaster.value.name && datamaster.value.name.trim()) {
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
    datamasterDialog.value = true;
    modalHeader.value = "Edit Department";
};

const confirmDeleteDatamaster = (editDatamaster) => {
    datamaster.value = editDatamaster;
    deleteDatamasterDialog.value = true;
};

const deleteDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/department/${datamaster.value.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            // Memuat ulang data setelah penghapusan berhasil
            onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            deleteDatamasterDialog.value = false;
            datamaster.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Department Deleted', life: 3000 });
        } else {
            if (response.status === 500 && data.error.includes('Integrity constraint violation')) {                
                throw new Error('Tidak dapat hapus data ini, karena masih digunakan pada data lain');
            } else {
                throw new Error(data.error || 'Failed to delete department');
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
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-2">
                            <h5 class="m-0">Master Department</h5>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button v-if="hasCreateMasterPermission" label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" @click="openNew" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="datamasters.data"
                    dataKey="id"
                    :paginator="true"
                    class="p-datatable-gridlines"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} datamaster"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." @input="onSearch($event)"/>
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
                    <Column field="name"  headerStyle="width:60%; min-width:10rem;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: right; width: 50%">
                                <span style="width: 100%">Department</span>
                            </div>
                        </template>
                        <template #body="slotProps">                            
                            {{ slotProps.data.name }}
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

                <Dialog v-model:visible="datamasterDialog" :style="{ width: '450px' }" :header="modalHeader" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">Department</label>
                        <InputText id="name" v-model.trim="datamaster.name" required="true" autofocus :class="{ 'p-invalid': submitted && !datamaster.name }" />
                        <small class="p-invalid" v-if="submitted && !datamaster.name">Name is required.</small>
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
                        <Button label="No" icon="pi pi-times" :style="{ background: 'white', color: 'red', borderColor: 'red', }" @click="deleteDatamasterDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-primary" @click="deleteDatamaster" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
