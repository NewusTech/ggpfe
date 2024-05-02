<script setup>
import { ref, onMounted, onBeforeMount, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiBaseUrl } from '@/config/apiConfig';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const router = useRouter();

const toast = useToast();

const datamaster = ref({});

const selectedSloc = ref([]);
const searchsbin = ref([]);
const this_material_id = ref([]);
const this_sbin_id = ref([]);

const qty_matloc = ref([]);

const s_locs = ref([]);
const s_bins = ref([]);
const adjustments = ref([]);
const materials = ref([]);
const idfromroute = ref(null);
const submitted = ref(false);

const items = ref([{ label: 'Adjustment', route: '/adjustment' }, { label: 'Add Adjustment' }]);

onBeforeMount(async () => {
});

onMounted(async () => {
    idfromroute.value = router.currentRoute.value.params.id;

    try {
        const response_adjustment = await fetch(`${apiBaseUrl}/api/master/adjustment`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const dataadjustment = await response_adjustment.json();

        if (response_adjustment.ok) {
            adjustments.value = dataadjustment.data.data;
        } else {
            throw new Error(dataadjustment.error || 'Failed to fetch storage location data from API');
        }

        const response_material = await fetch(`${apiBaseUrl}/api/master/material`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        const datamaterial = await response_material.json();

        if (response_material.ok) {
            materials.value = datamaterial.data.data;
        } else {
            throw new Error(datamaterial.error || 'Failed to fetch storage location data from API');
        }

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
    } catch (error) {
        console.error('Error fetching data from API:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    }
});

const searchMaterial = async (event) => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/material?search=${event.value}&paginate_count=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            materials.value = data.data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch material data from API');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch material', life: 5000 });
    }
};

const searchStorageLocations = async (event) => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/master/storage_location?search=${event.value}&paginate_count=10`, {
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

const searchStorageBin = async (event) => {
    try {
        searchsbin.value = event.value;
        const response = await fetch(`${apiBaseUrl}/api/master/storage_bin?search=${searchsbin.value != null ? searchsbin.value : ""}&paginate_count=10&s_loc=${selectedSloc.value.id != null ? selectedSloc.value.id : ""}`, {
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

const updateInfo = async (selectedMaterialCode) => {
    const selectedMaterial = materials.value.find(material_code => material_code.code === selectedMaterialCode);
    this_material_id.value = selectedMaterial.id;

    if (selectedMaterial) {
        datamaster.value.uom = selectedMaterial.uom.name;
    }

    if (this_sbin_id.value && this_material_id.value) {
        try {
            const response = await fetch(`${apiBaseUrl}/api/adjustment/getfrommatloc?material_id=${this_material_id.value != null ? this_material_id.value : ""}&sbin_id=${this_sbin_id.value != null ? this_sbin_id.value : ""}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                qty_matloc.value = data.data.qty;
                datamaster.value.qty = qty_matloc.value ?? 0;
                console.log(data.data)
            } else {
                throw new Error(data.error || 'Failed to fetch storage bin data from API');
            }
        } catch (error) {
            console.error('Error fetching storage bin data:', error);
            // Handle error
        }
    }
};

const updateInfo3 = async (selecteddata) => {
    this_sbin_id.value = selecteddata;

    if (this_sbin_id.value && this_material_id.value) {
        try {
            const response = await fetch(`${apiBaseUrl}/api/adjustment/getfrommatloc?material_id=${this_material_id.value != null ? this_material_id.value : ""}&sbin_id=${this_sbin_id.value != null ? this_sbin_id.value : ""}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.data)
                qty_matloc.value = data.data.qty;
                datamaster.value.material_loc_id = data.data.id;
                datamaster.value.qty = qty_matloc.value ?? 0;
            } else {
                throw new Error(data.error || 'Failed to fetch storage bin data from API');
            }
        } catch (error) {
            console.error('Error fetching storage bin data:', error);
            // Handle error
        }
    }
};

const updateInfo2 = async (selectedSlocCode) => {
    selectedSloc.value = s_locs.value.find(sloc => sloc.name === selectedSlocCode);

    if (selectedSloc.value) {
        datamaster.value.sloc_desc = selectedSloc.value.name;

        try {
            const response = await fetch(`${apiBaseUrl}/api/master/storage_bin?s_loc=${selectedSloc.value.id != null ? selectedSloc.value.id : ""}`, {
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

const updateqty = (qty_fisik, qty) => {
    if (qty_fisik != null & qty != null ) {
        datamaster.value.qty_adjustment = qty - qty_fisik;
    }
};

watch(() => datamaster.value.qty_physical, () => {
    updateqty(datamaster.value.qty_physical, datamaster.value.qty);
});

watch(() => datamaster.value.qty, () => {
    updateqty(datamaster.value.qty_physical, datamaster.value.qty);
});

const createDatamaster = async () => {
    try {
        const response = await fetch(`${apiBaseUrl}/api/adjustment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                material_loc_id: datamaster.value.material_loc_id,
                adjustment_id: datamaster.value.adjustment_id.id,
                qty_physical: datamaster.value.qty_physical,
                qty_before: datamaster.value.qty,
                qty_adjustment: datamaster.value.qty_adjustment,
                batch: datamaster.value.batch,
                description: datamaster.value.description,
            })
        });
        const data = await response.json();

        if (response.ok) {
            submitted.value = false;
            datamaster.value = {};
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Data Adjustment Created', life: 3000 });
        } else {
            throw new Error(data.error || 'Failed to create data Adjustment');
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 });
    }
};

const saveDatamaster = () => {
    submitted.value = true;

    if (datamaster.value.s_bin && datamaster.value.s_bin.id !== null && datamaster.value.material_id && datamaster.value.material_id.id !== null && datamaster.value.adjustment_id && datamaster.value.adjustment_id.id !== null && datamaster.value.qty_physical ) {
        // if (datamaster.value.id) {
        //     updateDatamaster();
        // } else {
            createDatamaster();
        // }
        
    }
};
</script>

<template>
    <Breadcrumb :model="items">
        <template #item="{ item, props }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a :href="href" v-bind="props.action" @click="navigate">
                    <span :class="[item.icon, 'text-color']" />
                    <span class="text-primary font-semibold">{{ item.label }}</span>
                </a>
            </router-link>
            <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                <span class="text-color">{{ item.label }}</span>
            </a>
        </template>
    </Breadcrumb>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />

                <Toolbar class="mb-4 p-0" style="border: none; background-color: white">
                    <template v-slot:start>
                        <div class="my-1">
                            <h5 class="m-0">Add New Adjustment</h5>
                        </div>
                    </template>
                    <template v-slot:end>
                        <Button label="Save" class="p-button-primary mr-2 px-6" @click="saveDatamaster" />
                    </template>
                </Toolbar>
                <Divider />

                <div class="formgrid grid p-fluid">
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="adjustment_id">Category Adjustment</label>
                        <Dropdown id="adjustment_id" v-model="datamaster.adjustment_id" :options="adjustments"
                            optionLabel="name" placeholder="Select adjustment"
                            :class="{ 'p-invalid': submitted && !datamaster.adjustment_id }" required="true">
                            <template #value="slotProps">
                                <div v-if="slotProps.value && slotProps.value.id">
                                    {{ slotProps.value.name }}
                                </div>
                                <span v-else>
                                    {{ slotProps.placeholder }}
                                </span>
                            </template>
                        </Dropdown>
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.adjustment_id">Adjustment
                            is
                            required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="s_loc">Storage Location</label>
                        <Dropdown id="s_loc" v-model="datamaster.s_loc" :options="s_locs" optionLabel="name"
                            @filter="searchStorageLocations" @change="updateInfo2(datamaster.s_loc.name)" filter
                            placeholder="Select storage location">
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

                    <div class="field col-12 md:col-6 mb-4">
                        <label for="material_id">Material</label>
                        <Dropdown id="material_id" v-model="datamaster.material_id" :options="materials"
                            optionLabel="code" placeholder="Select material"
                            @change="updateInfo(datamaster.material_id.code)"
                            :class="{ 'p-invalid': submitted && !datamaster.material_id }" required="true"
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
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.material_id">Material is
                            required.</small>
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="s_bin">Storage Bin</label>
                        <Dropdown id="s_bin" v-model="datamaster.s_bin" :options="s_bins" optionLabel="name"
                            @change="updateInfo3(datamaster.s_bin.id)" placeholder="Select storage bin"
                            :class="{ 'p-invalid': submitted && !datamaster.s_bin }" required="true"
                            @filter="searchStorageBin" filter>
                            <template #value="slotProps">
                                <div v-if="slotProps.value && slotProps.value.id">
                                    {{ slotProps.value.name }}
                                </div>
                                <span v-else>
                                    {{ slotProps.placeholder }}
                                </span>
                            </template>
                        </Dropdown>
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.s_bin">Storage bin is
                            required.</small>
                    </div>

                    <div class="field col-6 md:col-3">
                        <label for="zip">Qty</label>
                        <InputText id="qty" v-model="datamaster.qty" disabled />
                    </div>

                    <div class="field col-6 md:col-3">
                        <label for="zip">Qty (Physical)</label>
                        <InputNumber v-model="datamaster.qty_physical" inputId="integeronly" :class="{ 'p-invalid': submitted && !datamaster.qty_physical }" />
                        <small class="p-invalid text-red-500" v-if="submitted && !datamaster.qty_physical">Qty is
                            required.</small>
                    </div>

                    <div class="field col-6 md:col-3">
                        <label for="zip">Qty Adjustment</label>
                        <InputNumber v-model="datamaster.qty_adjustment" inputId="integeronly" disabled/>
                    </div>

                    <div class="field col-6 md:col-3">
                        <label for="uom">UoM</label>
                        <InputText id="uom" v-model="datamaster.uom" disabled />
                    </div>

                    <div class="field col-12 md:col-6 mb-4">
                        <label for="batch">Batch</label>
                        <InputText id="batch" v-model="datamaster.batch" />
                    </div>
                    <div class="field col-12 md:col-6 mb-4">
                        <label for="description">Description</label>
                        <InputText id="description" v-model="datamaster.description" />
                    </div>
                </div>

                <div class="my-5"></div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
