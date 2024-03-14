<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
const toast = useToast();

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
const departements = ref([]);
const roless = ref([]);
const s_locs = ref([]);
const op = ref(null);
const overlayData = ref({});
const isValidEmail = (email) => {
    // Implementasi logika validasi email di sini
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const onPage = async (event) => {
    event.page+=1;

    try {              
        const response = await fetch(`${apiBaseUrl}/api/roles?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}&paginate_count=${event.rows}`, {
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
    initFilters();
});

onMounted(async () => {
    try {
        // Fetch data from Laravel API
        const response = await fetch(`${apiBaseUrl}/api/roles`, {
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

        // Ambil data roles dari Laravel API
        const responseRoles = await fetch(`${apiBaseUrl}/api/roles`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const dataRoles = await responseRoles.json();

        if (responseRoles.ok) {
            roless.value = dataRoles.data.data;
        } else {
            throw new Error(dataRoles.error || 'Failed to fetch roles data from API');
        }

        // Ambil data departemen dari Laravel API
        const responseDepartement = await fetch(`${apiBaseUrl}/api/departement/master_departement`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const dataDepartement = await responseDepartement.json();

        if (responseDepartement.ok) {
            departements.value = dataDepartement.data.data;
        } else {
            throw new Error(dataDepartement.error || 'Failed to fetch departement data from API');
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
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const openNew = () => {
    datamaster.value = {};
    submitted.value = false;
    datamasterDialog.value = true;
    modalHeader.value = 'Add New Role';
};

const hideDialog = () => {
    datamasterDialog.value = false;
    submitted.value = false;
};

const updateDatamaster = async () => {
    try {
        const dobDate = new Date(datamaster.value.dob);
        const response = await fetch(`${apiBaseUrl}/api/roles/${datamaster.value.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name,            
            })
        });
        const data = await response.json();

        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });
      
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Role Updated', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to update data Role');
        }
    } catch (error) {        
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update data Role', life: 5000 });
    }
};

const createDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/roles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name,            
            })
        });
        const data = await response.json();


        if (response.ok) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Role Created', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to create data Role');
        }
    } catch (error) {        
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create data Role', life: 5000 });
    }
};

const saveDatamaster = () => {
    submitted.value = true;
    if (
        datamaster.value.name &&
        datamaster.value.name.trim()      
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

    datamasterDialog.value = true;
    modalHeader.value = 'Edit Role';
};

const confirmDeleteDatamaster = (editDatamaster) => {
    datamaster.value = editDatamaster;
    deleteDatamasterDialog.value = true;
};

const deleteDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/roles/${datamaster.value.id}`, {
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
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Role Deleted', life: 3000 });
        } else {
            if (response.status === 500 && data.error.includes('Integrity constraint violation')) {
                throw new Error('Tidak dapat hapus data ini, karena masih digunakan pada data lain');
            } else {
                throw new Error(data.error || 'Failed to delete Role');
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
                            <h5 class="m-0">Management Role</h5>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" @click="openNew" />
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
                    <Column field="name" headerStyle="width:65%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Nama</span>
                            </div>
                        </template>
                        <template #body="slotProps">                            
                            {{ slotProps.data.name }}
                        </template>
                    </Column>                
                    <Column style="text-align: center" headerStyle="width:30%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 100%">
                                <span style="width: 100%">Action</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <span @click="editDatamaster(slotProps.data)" style="cursor: pointer; color: #5e42ce" class="mr-3">Edit</span>
                            <span @click="confirmDeleteDatamaster(slotProps.data)" style="cursor: pointer; color: #ff5742">Delete</span>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="datamasterDialog" :style="{ width: '450px' }" :header="modalHeader" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">Name</label>
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
                        <Button label="No" icon="pi pi-times" :style="{ background: 'white', color: 'red', borderColor: 'red' }" @click="deleteDatamasterDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-primary" @click="deleteDatamaster" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
