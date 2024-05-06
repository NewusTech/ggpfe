<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useStore } from 'vuex';

const store = useStore();
const department_name = ref(null);
const department_id = ref(null);

const select_report = ref(null);

const options = ref([
    { name: 'Inbound', value: 'Inbound' },
    { name: 'Outbound', value: 'Outbound' },
    { name: 'Stock Opname', value: 'Stock Opname' },
    { name: 'Adjustment', value: 'Adjustment' },
]);

const toast = useToast();
const datamasters = ref([]);
const dt = ref(null);
const filters = ref({});
const totalRecords = ref(null);
const search = ref(null);
const s_locs = ref([]);
const filtersloc = ref(null);
const filterend = ref(null);
const filterstart = ref(null);

const apiselect = ref('inbound');

watch(select_report, async (newValue, oldValue) => {
    if (newValue.value === 'Outbound') {
        apiselect.value = 'outbound'
    } else if (newValue.value === 'Inbound') {
        apiselect.value = 'inbound'
    } else if (newValue.value === 'Stock Opname') {
        apiselect.value = 'stock_opname'
    } else if (newValue.value === 'Adjustment') {
        apiselect.value = 'adjustment'
    }
});

const onPage = async (event) => {
    try {

        const datestart = filterstart && filterstart.value ? new Date(filterstart.value) : null;
        const filterstartfix = datestart ? datestart.toISOString().split('T')[0] : null;

        const dateend = filterend && filterend.value ? new Date(filterend.value) : null;
        const filterendfix = dateend ? dateend.toISOString().split('T')[0] : null;
        
        let apiUrl = `${apiBaseUrl}/api/report/${apiselect.value}?`;

        if (filtersloc.value && filtersloc.value.id) {
            apiUrl += `s_loc_id=${filtersloc.value.id}&`;
        }

        if (filterstartfix) {
            apiUrl += `start_date=${filterstartfix}&`;
        }

        if (filterendfix) {
            apiUrl += `end_date=${filterendfix}&`;
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
       
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'report.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
    initFilters();
});

onMounted(async () => {
    try {
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

const searchStorageLocations = async (event) => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/sloc/master_storage_location?search=${event.value}&paginate_count=15`, {
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

</script>

<template>
    <SelectButton v-model="select_report" :options="options" optionLabel="name" aria-labelledby="multiple" />

    <div class="grid mt-1">
        <div class="col-12">
            <div class="card">
                <Toast />

                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-2">
                            <h5 class="m-0">Report</h5>
                        </div>
                    </template>
                </Toolbar>

                <pre>{{ datamasters }}</pre>

                <div class="grid p-fluid">
                    <div class="field col-12 md:col-6 lg:col-3">
                        <label for="s_loc" class="mb-3">Start Date</label>
                        <Calendar v-model="filterstart" class="w-full" showIcon iconDisplay="input" />
                    </div>
                    <div class="field col-12 md:col-6 lg:col-3">
                        <label for="s_loc" class="mb-3">End Date</label>
                        <Calendar v-model="filterend" class="w-full" showIcon iconDisplay="input" />
                    </div>
                    <div class="field col-12 md:col-6 lg:col-4">
                        <label for="s_loc" class="mb-3">Storage Location</label>
                        <Dropdown id="s_loc" v-model="filtersloc" :options="s_locs" optionLabel="name"
                            placeholder="Pilih filter" @filter="searchStorageLocations" filter>
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
                    <div class="field col-12 md:col-6 lg:col-2">
                        <label for="s_loc" class="mb-3 text-white">a</label>
                        <Button label="Submit" class="p-button-primary mr-2" @click="onSearch($event)" />
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
