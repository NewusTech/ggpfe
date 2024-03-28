<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();
const toast = useToast();

const dataReceived = ref(null);
const department_name = ref(null);
const department_id = ref(null);
const datamasters = ref([]);
const datamastersReleaseSAP = ref([]);
const dt = ref(null);
const filters = ref({});
const totalRecords = ref(null);
const search = ref(null);
const first = ref(0);
const loading = ref(null);
const SAPDialog = ref(false);
const modalHeader = ref('');
const selecteddata = ref();
const selecteddata2 = ref();
const expandedRows = ref([]);

const getSelect = () => {
    const childs = selecteddata.value.map((v) => v.materials).flat();
    selecteddata2.value = [...childs];
};

watch(
    () => selecteddata.value,
    () => {
        getSelect();
    }
);

const onPage = async (event) => {
    event.page += 1;

    try {
        const apiUrl = `${apiBaseUrl}/api/outbound?page=${event.page}&sortField=${event.sortField}&sortOrder=${event.sortOrder}&search=${search.value != null ? search.value : ''}`;

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

onBeforeMount(async () => {
    const storeDepartmentName = store.state.department_name;
    const storeDepartmentID = store.state.department_id;

    if (storeDepartmentName !== null) {
        department_name.value = storeDepartmentName;
        department_id.value = storeDepartmentID;
    } else {
        store.watch(
            (state) => state.department_id,
            (newVal) => {
                department_id.value = newVal;
            }
        );
        store.watch(
            (state) => state.department_name,
            (newVal) => {
                department_name.value = newVal;
            }
        );
    }

    initFilters();
    dataReceived.value = router.currentRoute.value.meta ? router.currentRoute.value.meta.dataToSend.value : null;
});

const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
};

onMounted(async () => {
    try {
        // get data user
        const responseUSER = await fetch(`${apiBaseUrl}/api/auth/get_user/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const datauser = await responseUSER.json();

        department_id.value = datauser.data.departement_id;

        const apiUrl = `${apiBaseUrl}/api/outbound`;

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

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const openNew = () => {
    datamastersReleaseSAP.value = datamasters.value.filter(item => item.status === 1)
        .map(item => ({
            ...item,
            materials: item.materials.filter(material => material.status === 2)
        }));
    SAPDialog.value = true;
    modalHeader.value = 'Release to SAP';
};

const hideDialog = () => {
    SAPDialog.value = false;
};

const releaseToSAP = async () => {
    try {
        const selectedIds = selecteddata2.value.map(item => item.id);

        const apiUrl = `${apiBaseUrl}/api/sap/releaseSAPout`;
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
            SAPDialog.value = false;
            selecteddata.value = [];
            selecteddata2.value = [];
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
                            <h5 class="m-0">Outbound</h5>
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
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <Button label="Release to SAP" class="p-button-primary mr-2" @click="openNew" />
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
                    <Column field="code" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Code</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <router-link v-if="dataReceived !== 'request'" :to="'/outbound/' + slotProps.data.id"
                                class="text-primary">{{ slotProps.data.code }}</router-link>
                            <router-link v-else-if="dataReceived === 'request'"
                                :to="'/outbound-request/' + slotProps.data.id" class="text-primary">{{ slotProps.data.code
                                }}</router-link>
                        </template>
                    </Column>
                    <Column field="date" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Date</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.created_at) }}
                        </template>
                    </Column>
                    <Column field="reference_type" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                :style="{ 'text-align': 'center', width: '90%' }">
                                <span style="width: 100%">Reference Doc</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.ref_code }}
                        </template>
                    </Column>
                    <Column field="type" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Type</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.ref_type }}
                        </template>
                    </Column>
                    <Column field="s_loc" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Storage Location</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.s_loc }}
                        </template>
                    </Column>
                    <Column field="mvt_code" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Movement Type</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.mvt_code }}
                        </template>
                    </Column>
                    <Column field="good_recepient" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Good Recipient</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.good_recepient }}
                        </template>
                    </Column>
                    <Column field="receiving_s_loc" headerStyle="width:15%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 90%">
                                <span style="width: 100%">Receiving S. Loc</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            {{ slotProps.data.receiving_s_loc }}
                        </template>
                    </Column>
                    <Column style="text-align: center" field="status" headerStyle="width:10%;">
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                style="text-align: center; width: 100%">
                                <span style="width: 100%">Status</span>
                            </div>
                        </template>
                        <template #body="slotProps">
                            <p style="color: green;" v-if="slotProps.data.status == 2">Complete</p>
                            <p class="text-primary" v-else>On Progress</p>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="SAPDialog" :style="{ width: '85%' }" :header="modalHeader" :modal="true"
                    class="p-fluid">
                    <div class="field">
                        <label for="material_code">Choose your data to release</label>
                    </div>

                    <DataTable ref="dt" v-model:selection="selecteddata" :value="datamastersReleaseSAP"
                        v-model:expandedRows="expandedRows" dataKey="id" class="p-datatable-gridlines"
                        responsiveLayout="scroll">
                        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                        <Column field="code" headerStyle="width:10%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    :style="{ 'text-align': 'center', width: '90%' }">
                                    <span style="width: 100%">Code</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                <router-link v-if="dataReceived !== 'request'" :to="'/outbound/' + slotProps.data.id"
                                    class="text-primary">{{ slotProps.data.code }}</router-link>
                                <router-link v-else-if="dataReceived === 'request'"
                                    :to="'/outbound-request/' + slotProps.data.id" class="text-primary">{{
                                        slotProps.data.code }}</router-link>
                            </template>
                        </Column>
                        <Column field="date" headerStyle="width:10%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    style="text-align: center; width: 90%">
                                    <span style="width: 100%">Date</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.created_at) }}
                            </template>
                        </Column>
                        <Column field="ref_code" headerStyle="width:10%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    :style="{ 'text-align': 'center', width: '90%' }">
                                    <span style="width: 100%">Reference Doc</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                {{ slotProps.data.ref_code }}
                            </template>
                        </Column>
                        <Column field="ref_type" headerStyle="width:10%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    style="text-align: center; width: 90%">
                                    <span style="width: 100%">Type</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                {{ slotProps.data.ref_type }}
                            </template>
                        </Column>
                        <Column field="s_loc" headerStyle="width:10%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    style="text-align: center; width: 90%">
                                    <span style="width: 100%">Storage Location</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                {{ slotProps.data.s_loc }}
                            </template>
                        </Column>
                        <Column field="mvt_id" headerStyle="width:10%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    style="text-align: center; width: 90%">
                                    <span style="width: 100%">Movement Type</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                {{ slotProps.data.mvt_id }}
                            </template>
                        </Column>
                        <Column field="good_recepient" headerStyle="width:10%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    style="text-align: center; width: 90%">
                                    <span style="width: 100%">Good Recipient</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                {{ slotProps.data.good_recepient }}
                            </template>
                        </Column>
                        <Column field="receiving_s_loc" headerStyle="width:15%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    style="text-align: center; width: 90%">
                                    <span style="width: 100%">Receiving S. Loc</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                {{ slotProps.data.receiving_s_loc }}
                            </template>
                        </Column>
                        <Column style="text-align: center" field="status" headerStyle="width:10%;">
                            <template #header>
                                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
                                    style="text-align: center; width: 100%">
                                    <span style="width: 100%">Status</span>
                                </div>
                            </template>
                            <template #body="slotProps">
                                <p class="text-primary">{{ slotProps.data.status === 1 ? 'Complete' : 'On Progress' }}</p>
                            </template>
                        </Column>
                        <Column header="Action" :expander="true" headerStyle="min-width: 3rem" />

                        <template #expansion="slotProps">
                            <div class="p-1">
                                <DataTable v-model:selection="selecteddata2" v-if="slotProps.data.materials.length > 0"
                                    :value="slotProps.data.materials" responsiveLayout="scroll">
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
                                    <Column field="s_bin" header="Storage Bin">
                                        <template #body="slotProps">
                                            {{ slotProps.data.s_bin }}
                                        </template>
                                    </Column>
                                    <Column field="batch" header="Batch">
                                        <template #body="slotProps">
                                            {{ slotProps.data.batch }}
                                        </template>
                                    </Column>
                                    <Column field="qty" header="Requirement Date">
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
                        <Button label="Cancel" icon="pi pi-times" @click="hideDialog"
                            :style="{ background: 'white', color: 'blue' }" />
                        <Button label="Release" icon="pi pi-check" class="p-button-primary" @click="releaseToSAP" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.p-dialog .p-dialog-header {
    background: #ffffff;
}
</style>
