<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useStore } from 'vuex';

const store = useStore();
const permission_user = ref(null);
const toast = useToast();
const AproveDialog = ref(false);
const modalHeader = ref('');

const hasAddAdjustmentPermission = ref(null);
const hasApprovalAdjustmentPermission = ref(null);

const datamasters = ref([]);
const datamastersformodal = ref([]);
const deleteDatamasterDialog = ref(false);
const datamaster = ref({});
const dt = ref(null);
const filters = ref({});
const search = ref(null);
const totalRecords = ref(null);

const selecteddata = ref();

const onPage = async (event) => {
    event.page += 1;

    try {
        const apiUrl = `${apiBaseUrl}/api/adjustment?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}`;

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
    onPage({ page: 0, search: event.target.value });
};

onBeforeMount(() => {
    const storePermission = store.state.permission;

    if (storePermission !== null) {
        permission_user.value = storePermission;
        hasAddAdjustmentPermission.value = permission_user.value.some(perm => perm.name === 'add-adjustment');
        hasApprovalAdjustmentPermission.value = permission_user.value.some(perm => perm.name === 'approval-adjustment');
    } else {
        // Tunggu hingga nilai diupdate oleh fetch di AppLayout
        store.watch(
            (state) => state.permission,
            (newVal) => {
                permission_user.value = newVal;
                hasAddAdjustmentPermission.value = permission_user.value.some(perm => perm.name === 'add-adjustment');
                hasApprovalAdjustmentPermission.value = permission_user.value.some(perm => perm.name === 'approval-adjustment');
            }
        );
    }
    initFilters();
});

onMounted(async () => {
    try {

        //get url 
        const apiUrl = `${apiBaseUrl}/api/adjustment`;

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
        console.error('Error fetching data from API:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const updateData = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/sbin/master_storage_bin`, {
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

const confirmDeleteDatamaster = (editDatamaster) => {
    datamaster.value = editDatamaster;
    deleteDatamasterDialog.value = true;
};

const deleteDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/adjustment/${datamaster.value.id}`, {
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
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Storage Bin Deleted', life: 3000 });
        } else {
            if (response.status === 500 && data.error.includes('Integrity constraint violation')) {
                throw new Error('Tidak dapat hapus data ini, karena masih digunakan pada data lain');
            } else {
                throw new Error(data.error || 'Failed to delete Storage Bin');
            }
        }
    } catch (error) {
        console.error('Error deleting Storage Bin:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 5000 });
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const aproveData = async () => {

    const ids = selecteddata.value.map(item => item.id)

    console.log(ids)
    try {
        const response = await fetch(`${apiBaseUrl}/api/adjustment/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                id_adjustment: ids
                // tambahkan field lain sesuai kebutuhan
            })
        });


        if (response.ok) {
            AproveDialog.value = false;
            selecteddata.value = [];
            // console.log(search.value, dt.value?.sortField, dt.value?.sortOrder)
            onPage({ page: 0, search: search.value, sortField: dt.value?.sortField, sortOrder: dt.value?.sortOrder });
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Aproved', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Failed', detail: error, life: 5000 });
    }
}

const openAprove = async () => {
    datamastersformodal.value = datamasters.value.filter(item => item.status === 0);

    AproveDialog.value = true;
    modalHeader.value = 'Aproval';
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
                            <h5 class="m-0">Adjustment</h5>
                        </div>
                    </template>

                    <template v-slot:end>
                        <router-link to="adjustment/form-adjustment" v-if="hasAddAdjustmentPermission">
                            <Button label="Add New" icon="pi pi-plus-circle" class="p-button-primary mr-2" />
                        </router-link>
                        <div v-if="hasApprovalAdjustmentPermission" class="my-2">
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
                    <Column field="adjustment_number" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Adjustment Number</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.adjustment_number }}
                        </template>
                    </Column>
                    <Column field="s_loc" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Storage Location</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.materialloc.sbin.sloc.name }}
                        </template>
                    </Column>
                    <Column field="adjustment" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Adjustment Category</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.adjustment.name }}
                        </template>
                    </Column>
                    <Column field="s_bin" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Storage Bin</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.materialloc.sbin.name }}
                        </template>
                    </Column>
                    <Column field="description" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Description</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.description }}
                        </template>
                    </Column>
                    <Column field="status" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Status</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <p class="text-primary" v-if="slotProps.data.status === 1">Approved</p>
                            <p style="color: red;" v-else>On Request</p>
                        </template>
                    </Column>
                    <Column style="text-align: center" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 100%">
                                <span style="width: 100%">Action</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <Button icon="pi pi-file-edit" class="p-button-text p-button-primary mt-2" v-if="slotProps.data.status===0"/>
                            <Button icon="pi pi-trash" class="p-button-text p-button-danger mt-2"
                                @click="confirmDeleteDatamaster(slotProps.data)" v-if="slotProps.data.status===0"/>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="AproveDialog" :style="{ width: '95%' }" :header="modalHeader" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="material_code">Choose your data to aprove</label>
                    </div>

                    <DataTable v-model:selection="selecteddata" :value="datamastersformodal" dataKey="id"
                        responsiveLayout="scroll">
                        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                        <Column field="adjustment_number" header="Adjustment Number">
                            <template #body="slotProps">
                                {{ slotProps.data.adjustment_number }}
                            </template>
                        </Column>
                        <Column field="sloc" header="Storage Location">
                            <template #body="slotProps">
                                {{ slotProps.data.materialloc.sbin.sloc.name }}
                            </template>
                        </Column>
                        <Column field="sbin" header="Storage Bin">
                            <template #body="slotProps">
                                {{ slotProps.data.materialloc.sbin.name }}
                            </template>
                        </Column>
                        <Column field="adjustment" header="Ctgr. Adjustment">
                            <template #body="slotProps">
                                {{ slotProps.data.adjustment.name }}
                            </template>
                        </Column>
                        <Column field="material_code" header="Material Code">
                            <template #body="slotProps">
                                {{ slotProps.data.materialloc.material.code }}
                            </template>
                        </Column>
                        <Column field="material_desc" header="Material Desc">
                            <template #body="slotProps">
                                {{ slotProps.data.materialloc.material.desc }}
                            </template>
                        </Column>
                        <Column field="qty" header="Qty">
                            <template #body="slotProps">
                                {{ slotProps.data.qty_before }}
                            </template>
                        </Column>
                        <Column field="qty_physical" header="Qty physical">
                            <template #body="slotProps">
                                {{ slotProps.data.qty_physical }}
                            </template>
                        </Column>
                        <Column field="qty_adjustment" header="Qty adjustment">
                            <template #body="slotProps">
                                {{ slotProps.data.qty_adjustment }}
                            </template>
                        </Column>
                        <Column field="batch" header="Batch">
                            <template #body="slotProps">
                                {{ slotProps.data.batch }}
                            </template>
                        </Column>

                        <!-- 
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
                        </Column> -->
                    </DataTable>

                    <template #footer>
                        <Button label="Cancel" @click="hideDialog" :style="{ background: 'white', color: 'blue' }" />
                        <Button label="Aprove" @click="aproveData" class="p-button-primary" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteDatamasterDialog" :style="{ width: '450px' }" header="Confirm"
                    :modal="true">
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
