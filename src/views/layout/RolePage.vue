<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useStore } from 'vuex';

const store = useStore();
const permission_user = ref(null);

const toast = useToast();
const datamasters = ref([]);
const modalHeader = ref('');
const datamasterDialog = ref(false);
const permisDialog = ref(false);
const deleteDatamasterDialog = ref(false);
const datamaster = ref({});
const datapermis = ref({});
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const totalRecords = ref(null);
const search = ref(null);
const allpermission = ref([]);
const permissionformrole = ref([]);
const hasCreateRolePermission = ref(null);
const hasEditRolePermission = ref(null);
const hasDeleteRolePermission = ref(null);

const onPage = async (event) => {
    event.page += 1;

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
    const storePermission = store.state.permission;

    if (storePermission !== null) {
        permission_user.value = storePermission;
        hasCreateRolePermission.value = permission_user.value.some(perm => perm.name === 'create-role');
        hasEditRolePermission.value = permission_user.value.some(perm => perm.name === 'edit-role');
        hasDeleteRolePermission.value = permission_user.value.some(perm => perm.name === 'delete-role');
    } else {
        // Tunggu hingga nilai diupdate oleh fetch di AppLayout
        store.watch(
            (state) => state.permission,
            (newVal) => {       
                permission_user.value = newVal;
                hasCreateRolePermission.value = permission_user.value.some(perm => perm.name === 'create-role');
                hasEditRolePermission.value = permission_user.value.some(perm => perm.name === 'edit-role');
                hasDeleteRolePermission.value = permission_user.value.some(perm => perm.name === 'delete-role');
            }
        );
    }

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

        // Ambil data dari Laravel API
        const response2 = await fetch(`${apiBaseUrl}/api/permissions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data2 = await response2.json();

        if (response2.ok) {
            allpermission.value = data2.data;
        } else {
            throw new Error(data2.error || 'Failed to fetch storage bin data from API');
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
    permisDialog.value = false;
    submitted.value = false;
};

const updateDatamaster = async () => {
    let messageeror = 'Failed to updated data Role';

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

        if (data.success === true) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Role Updated', life: 3000 });
        } else {
            if (data.message.name[0]) {
                messageeror = data.message.name[0];
            }
            throw new Error(data.error || 'Failed to updated Role');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: messageeror, life: 5000 });
    }
};

const createDatamaster = async () => {
    let messageeror = 'Failed to create data Role';

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

        if (data.success === true) {
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Role Created', life: 3000 });
        } else {
            if (data.message.name[0]) {
                messageeror = data.message.name[0];
            }
            throw new Error(data.error || 'Failed to create Role');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: messageeror, life: 5000 });
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

        console.log(data)

        if (data.success === true) {
            // Memuat ulang data setelah penghapusan berhasil
            await onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder, rows: dt.value?.rows });

            deleteDatamasterDialog.value = false;
            datamaster.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Role Deleted', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to delete Role');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete Role', life: 5000 });
    }
};

const permission = async (rolee) => {
    submitted.value = true;

    // Ambil data dari Laravel API
    const response = await fetch(`${apiBaseUrl}/api/roles/${rolee.id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const data = await response.json();

    if (response.ok) {
        console.log('111',allpermission)
        permissionformrole.value = data.data;

        console.log("222", permissionformrole)
    } else {
        throw new Error(data.error || 'Failed to fetch storage bin data from API');
    }

    datapermis.value.permis = permissionformrole.value.map((role) => role.name);

    datapermis.value.id = rolee.id;

    permisDialog.value = true;
    modalHeader.value = 'Role Permission';
};

const savePermis = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/roles/${datapermis.value.id}/permissions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                permissions: datapermis.value.permis,
            })
        });
        const data = await response.json();

        if (data.success === true) {
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Permission Updated', life: 3000 });
            permisDialog.value = false;
            datapermis.value = {};
            submitted.value = false;
        } else {
            throw new Error(data.error || 'Failed to updated Permission');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to updated Permission', life: 5000 });
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
                        <Button v-if="hasCreateRolePermission" label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" @click="openNew" />
                    </template>
                </Toolbar>

                <DataTable ref="dt" :value="datamasters.data" lazy :filters="filters" :first="first"
                    @page="onPage($event)" :last="totalRecords" :loading="loading" :totalRecords="totalRecords"
                    dataKey="id" class="p-datatable-gridlines" :paginator="true" @sort="onPage($event)" :rows="10"
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
                    <Column field="rowIndex" headerStyle="min-width:5%;" style="text-align: center">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 100%">
                                <span style="width: 100%">No</span>
                            </div>
                        </template>
                        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                    </Column>
                    <Column field="name" headerStyle="width:65%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Nama</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column style="text-align: center" headerStyle="width:30%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 100%">
                                <span style="width: 100%">Action</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <span v-if="hasCreateRolePermission" @click="permission(slotProps.data)" style="cursor: pointer; color: #0EA5E9"
                                class="mr-3">Permission</span>
                            <span v-if="hasEditRolePermission" @click="editDatamaster(slotProps.data)" style="cursor: pointer; color: #5e42ce"
                                class="mr-3">Edit</span>
                            <span v-if="hasDeleteRolePermission" @click="confirmDeleteDatamaster(slotProps.data)"
                                style="cursor: pointer; color: #ff5742">Delete</span>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="permisDialog" :style="{ width: '450px' }" :header="modalHeader" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <small class="p-invalid" style="color: red;" v-if="submitted && datapermis.permis.length == 0">Role minimal 1.</small>
                        <div v-for="permis in allpermission" :key="permis.id" class="flex align-items-center mb-2 justify-content-between">
                            <label :for="permis.id" class="ml-2">{{ permis.name }}</label>
                            <Checkbox v-model="datapermis.permis" :inputId="permis.id" :name="permis.name" 
                                :value="permis.name"/>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" @click="hideDialog"
                            :style="{ background: 'white', color: 'blue' }" />
                        <Button label="Save" icon="pi pi-check" class="p-button-primary" @click="savePermis"/>
                    </template>
                </Dialog>

                <Dialog v-model:visible="datamasterDialog" :style="{ width: '450px' }" :header="modalHeader"
                    :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="name">Name</label>
                        <InputText id="name" v-model.trim="datamaster.name" required="true" autofocus
                            :class="{ 'p-invalid': submitted && !datamaster.name }" />
                        <small class="p-invalid" v-if="submitted && !datamaster.name">Name is required.</small>
                    </div>

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" @click="hideDialog"
                            :style="{ background: 'white', color: 'blue' }" />
                        <Button label="Save" icon="pi pi-check" class="p-button-primary" @click="saveDatamaster" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteDatamasterDialog" :style="{ width: '450px' }" header="Confirm"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="datamaster">Are you sure you want to delete <b>{{ datamaster.name }}</b>?</span>
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
