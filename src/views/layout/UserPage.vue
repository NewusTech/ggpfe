<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useStore } from 'vuex';

const store = useStore();
const permission_user = ref(null);
const toast = useToast();

const hasCreateUserPermission = ref(null);
const hasEditUserPermission = ref(null);
const hasDeleteUserPermission = ref(null);
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
const departments = ref([]);
const roless = ref([]);
const s_locs = ref([]);
const op = ref(null);
const overlayData = ref({});
const isValidEmail = (email) => {
    // Implementasi logika validasi email di sini
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const showOverlay = (event) => {
    overlayData.value = event.target.__vueParentComponent.attrs.data;
    op.value.toggle(event);
};

const hideOverlay = () => {
    op.value.hide();
};

const formatRoles = (roles) => {
    return roles.map((role) => role.role_name).join(', ');
};

const formatSloc = (sloc) => {
    return sloc.map((slocc) => slocc.s_loc).join(', ');
};

const onPage = async (event) => {
    event.page += 1;

    try {
        const response = await fetch(`${apiBaseUrl}/api/users?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value}`, {
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
    const storePermission = store.state.permission;

    if (storePermission !== null) {
        permission_user.value = storePermission;
        hasCreateUserPermission.value = permission_user.value.some(perm => perm.name === 'create-user');
        hasEditUserPermission.value = permission_user.value.some(perm => perm.name === 'edit-user');
        hasDeleteUserPermission.value = permission_user.value.some(perm => perm.name === 'delete-user');
    } else {
        // Tunggu hingga nilai diupdate oleh fetch di AppLayout
        store.watch(
            (state) => state.permission,
            (newVal) => {       
                permission_user.value = newVal;
                hasCreateUserPermission.value = permission_user.value.some(perm => perm.name === 'create-user');
                hasEditUserPermission.value = permission_user.value.some(perm => perm.name === 'edit-user');
                hasDeleteUserPermission.value = permission_user.value.some(perm => perm.name === 'delete-user');
            }
        );
    }

    initFilters();
});

onMounted(async () => {
    try {
        // Fetch data from Laravel API
        const response = await fetch(`${apiBaseUrl}/api/users`, {
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
    } catch (error) {
        console.error('Error fetching data from API:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const updateData = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            datamasters.value = data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch data from API');
        }
    } catch (error) {
        console.error('Error updating data:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update data', life: 5000 });
    }
};

const openNew = async () => {
    datamaster.value = {};
    submitted.value = false;

    // Ambil data departemen dari Laravel API
    const response_location = await fetch(`${apiBaseUrl}/api/master/storage_location?paginate_count=200`, {
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

    datamasterDialog.value = true;
    modalHeader.value = 'Add New User';
};

const hideDialog = () => {
    datamasterDialog.value = false;
    submitted.value = false;
};

const updateDatamaster = async () => {
    let messageeror = 'Failed to updated data user';

    try {
        const response = await fetch(`${apiBaseUrl}/api/users/${datamaster.value.user_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name,
                email: datamaster.value.email,
                no_index: datamaster.value.no_index,
                department_id: datamaster.value.department.id,
                user_storage: datamaster.value.s_loc,
                roles: datamaster.value.roles.join(',')
            })
        });
        const data = await response.json();

        if (data.success === true) {
            await updateData();

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data User Updated', life: 3000 });
        } else {
            if (data.message.email[0]) {
                messageeror = data.message.email[0];
            }
            throw new Error(data.error || 'Failed to update data User');
        }
    } catch (error) {
        console.error('Error updating data User:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: messageeror, life: 5000 });
    }
};

const createDatamaster = async () => {
    let messageeror = 'Failed to created data user';

    try {
        const response = await fetch(`${apiBaseUrl}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                name: datamaster.value.name,
                email: datamaster.value.email,
                no_index: datamaster.value.no_index,
                department_id: datamaster.value.department.id,
                user_storage: datamaster.value.s_loc,
                roles: datamaster.value.roles.join(',')
            })
        });
        const data = await response.json();
        console.log(data)
        if (data.success === true) {
            await updateData();
            
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data User Created', life: 3000 });
        } else {
            if (data.message.email[0]) {
                messageeror = data.message.email[0];
            }
            throw new Error(data.error || 'Failed to create data User');
        }
    } catch (error) {
        console.error('Error creating data User:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: messageeror, life: 5000 });
    }
};

const saveDatamaster = () => {
    submitted.value = true;
    if (
        datamaster.value.name &&
        datamaster.value.name.trim() &&
        datamaster.value.s_loc &&
        datamaster.value.s_loc.id !== null &&
        datamaster.value.email &&
        datamaster.value.email.trim() &&
        datamaster.value.roles.length > 0
    ) {
        if (datamaster.value.user_id) {
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

    const selecteds_loc = s_locs.value.find((dep) => dep.id === datamaster.value.sloc_id);
    datamaster.value.s_loc = selecteds_loc;

     // Ambil data departemen dari Laravel API
     const response_location = await fetch(`${apiBaseUrl}/api/master/storage_location?paginate_count=200`, {
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

    const allStorageLocations = [];
    for (const vak of datamaster.value.master_storage_location) {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_location?&paginate_count=200&search=${vak.s_loc}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const shit = await response.json()
        allStorageLocations.push(...shit.data.data);
      
    }
    datamaster.value.s_loc = allStorageLocations;

    const responseDepartment = await fetch(`${apiBaseUrl}/api/master/department?search=${datamaster.value.name_department ? datamaster.value.name_department : ''}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const dataDepartment = await responseDepartment.json();

    if (responseDepartment.ok) {
        if (dataDepartment.data.data.length > 0) {
            datamaster.value.department = dataDepartment.data.data[0];
        }
    } else {
    }

    datamaster.value.roles = datamaster.value.roles.map((role) => role.role_name);

    datamasterDialog.value = true;
    modalHeader.value = 'Edit User';
};

const confirmDeleteDatamaster = (editDatamaster) => {
    datamaster.value = editDatamaster;
    deleteDatamasterDialog.value = true;
};

const deleteDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/users/${datamaster.value.user_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            // Memuat ulang data setelah penghapusan berhasil
            await updateData();

            deleteDatamasterDialog.value = false;
            datamaster.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
        } else {
            if (response.status === 500 && data.error.includes('Integrity constraint violation')) {
                throw new Error('Tidak dapat hapus data ini, karena masih digunakan pada data lain');
            } else {
                throw new Error(data.error || 'Failed to delete User');
            }
        }
    } catch (error) {
        console.error('Error deleting User:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 });
    }
};

const searchStorageLocations = async (event) => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_location?search=${event.value}&paginate_count=200`, {
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

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < datamasters.value.length; i++) {
        if (datamasters.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
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
                            <h5 class="m-0">Management User</h5>
                        </div>
                    </template>

                    <template v-slot:end>
                        <Button v-if="hasCreateUserPermission" label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" @click="openNew" />
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
                                <span style="width: 100%">Nama</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <p class="text-primary" @mouseover.prevent="showOverlay" @mouseout="hideOverlay">{{ slotProps.data.name }}</p>
                            <OverlayPanel ref="op" appendTo="body" style="width: 480px">
                                <div class="flex col m-0 p-0">
                                    <div class="col-6 my-2 p-0">Name</div>
                                    <div class="col-6 my-2 p-0">: {{ overlayData.name }}</div>
                                </div>
                                <div class="flex col m-0 p-0">
                                    <div class="col-6 my-2 p-0">Email</div>
                                    <div class="col-6 my-2 p-0">: {{ overlayData.email }}</div>
                                </div>
                            </OverlayPanel>
                        </template>
                    </Column>
                    <Column field="name_sloc" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Storage Location</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ formatSloc(slotProps.data.master_storage_location) }}
                        </template>
                    </Column>
                    <Column field="name_department" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Department</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.name_department }}
                        </template>
                    </Column>
                    <Column field="name_sloc" headerStyle="width:20%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 90%">
                                <span style="width: 100%">Role</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <div style="padding: 10px; background-color: #e9eef5; border: 0px; width: fit-content; border-radius: 8px">
                                {{ formatRoles(slotProps.data.roles) }}
                            </div>
                        </template>
                    </Column>
                    <Column style="text-align: center" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center" style="text-align: center; width: 100%">
                                <span style="width: 100%">Action</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <span v-if="hasEditUserPermission" @click="editDatamaster(slotProps.data)" style="cursor: pointer; color: #5e42ce" class="mr-3">Edit</span>
                            <span v-if="hasDeleteUserPermission" @click="confirmDeleteDatamaster(slotProps.data)" style="cursor: pointer; color: #ff5742">Delete</span>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="datamasterDialog" :style="{ width: '750px' }" :header="modalHeader" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">Name</label>
                        <InputText id="name" v-model.trim="datamaster.name" required="true" autofocus :class="{ 'p-invalid': submitted && !datamaster.name }" />
                        <small class="p-invalid" v-if="submitted && !datamaster.name">Name is required.</small>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="email" class="mb-3">Email</label>
                            <InputText v-model.trim="datamaster.email" required="true" autofocus :class="{ 'p-invalid': submitted && !isValidEmail(datamaster.email) }" type="email" />
                            <small class="p-invalid" v-if="submitted && !isValidEmail(datamaster.email)">Invalid email address.</small>
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="no_index" class="mb-3">No. Index</label>
                            <InputText v-model.trim="datamaster.no_index" autofocus />
                        </div>
                    </div>

                    <div class="flex justify-center-between" style="width: 100%">
                        <div class="field" style="width: 49%">
                            <label for="s_loc" class="mb-3">Storage Location</label>
                            <MultiSelect v-model="datamaster.s_loc" :options="s_locs" optionLabel="name" @filter="searchStorageLocations" filter placeholder="Select storage location" :maxSelectedLabels="3" :class="{ 'p-invalid': submitted && !datamaster.s_loc }" />
                            <small class="p-invalid" v-if="submitted && !datamaster.s_loc">Storage Location is required.</small>
                        </div>

                        <div class="field" style="width: 49%; margin-left: auto">
                            <label for="department" class="mb-3">Department</label>
                            <Dropdown id="department" v-model="datamaster.department" :options="departments" optionLabel="name" placeholder="Select">
                                <!-- :class="{ 'p-invalid': submitted && !datamaster.department }" -->
                                <!-- required="true" -->
                                <template #value="slotProps">
                                    <div v-if="slotProps.value && slotProps.value.id">
                                        {{ slotProps.value.name }}
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                            </Dropdown>
                            <!-- <small class="p-invalid" v-if="submitted && !datamaster.department">Department is required.</small> -->
                        </div>
                    </div>

                    <div class="field">
                        <label for="roles" class="mb-3">Role</label>
                        <div class="flex flex-wrap gap-3">
                            <div v-for="roles in roless" :key="roles.id" class="flex align-items-center">
                                <Checkbox v-model="datamaster.roles" :inputId="roles.id" :name="roles.name" :value="roles.name" />
                                <label :for="roles.id" class="ml-2">{{ roles.name }}</label>
                            </div>
                        </div>
                        <small class="p-invalid" v-if="submitted && !datamaster.roles">Role is required.</small>
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
                            >Are you sure you want to delete <b>{{ datamaster.s_bin }}</b
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
