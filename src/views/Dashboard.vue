<script setup>
import { onMounted, reactive, ref } from 'vue';
import { apiBaseUrl } from '@/config/apiConfig';

const datamasters = ref([]);
// const lineData = reactive({
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
//     datasets: [
//         {
//             label: 'This Year',
//             data: [],
//             fill: false,
//             backgroundColor: '#000000',
//             borderColor: '#000000',
//             tension: 0.4,
//         },
//         {
//             label: 'Last Year',
//             data: [],
//             borderDash: [5, 5],
//             fill: false,
//             backgroundColor: '#c0c0c0',
//             borderColor: '#c0c0c0',
//             tension: 0.4,
//         }
//     ]
// });

// const lineData2 = reactive({
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
//     datasets: [
//         {
//             label: 'This Year',
//             data: [],
//             fill: false,
//             backgroundColor: '#000000',
//             borderColor: '#000000',
//             tension: 0.4,
//         },
//         {
//             label: 'Last Year',
//             data: [],
//             borderDash: [5, 5],
//             fill: false,
//             backgroundColor: '#c0c0c0',
//             borderColor: '#c0c0c0',
//             tension: 0.4,
//         }
//     ]
// });

// const lineOptions = ref({
//     plugins: {
//         legend: {
//             align: 'end',
//             labels: {
//                 usePointStyle: true,
//                 pointStyle: 'circle',
//                 boxWidth: 4, 
//             }
//         }
//     }
// });

onMounted( async () => {
    // try {
    //     // Ambil data dari Laravel API
    //     const response = await fetch(`${apiBaseUrl}/api/dashboard`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${localStorage.getItem('token')}`
    //         }
    //     });

    //     const data = await response.json();

    //     if (response.ok) {
    //         datamasters.value = data.data;
    //         console.log(datamasters)
    //         updateChartData();
    //     } else {
    //         throw new Error(data.error || 'Failed to fetch data from API');
    //     }
    // } catch (error) {
    //     console.error('Error fetching data from API:', error);
    //     toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data from API', life: 5000 });
    // }
});

// function updateChartData() {
//     lineData.datasets[0].data = datamasters.value.total_inbound_this_year;
//     lineData.datasets[1].data = datamasters.value.total_inbound_last_year;
//     lineData2.datasets[0].data = datamasters.value.total_outbound_this_year;
//     lineData2.datasets[1].data = datamasters.value.total_outbound_last_year;
// }

</script>

<template>
    <div class="grid">
        <!-- <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-5">Total Material</span>
                        <div class="text-900 font-bold text-xl">{{ datamasters.count_material }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-5">Total User</span>
                        <div class="text-900 font-bold text-xl">{{ datamasters.count_user }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-5">Total Inbound</span>
                        <div class="text-900 font-bold text-xl">{{ datamasters.count_inbound }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-5">Total Outbound</span>
                        <div class="text-900 font-bold text-xl">{{ datamasters.count_outbound }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Inbound</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" />
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Outbound</h5>
                <Chart type="line" :data="lineData2" :options="lineOptions" />
            </div>
        </div> -->
    </div>
</template>