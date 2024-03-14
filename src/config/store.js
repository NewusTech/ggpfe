// store.js
import { createStore } from 'vuex';
import { apiBaseUrl } from '@/config/apiConfig';

const store = createStore({
    state: {
        department_name: null,
        department_id: null,
        user_name: null,
        role: null
    },
    mutations: {
        setDepartmentName(state, name) {
            state.department_name = name;
        },
        setDepartmentID(state, id) {
            state.department_id = id;
        },
        setusername(state, user_name) {
            state.user_name = user_name;
        },
        setrole(state, role) {
            state.role = role;
        },
        resetState(state) {
            state.department_name = null;
            state.department_id = null;
            state.user_name = null;
            state.role = null;
            // Add other state reset handling if needed
        }
    },
    actions: {
        async fetchDepartmentData({ commit }) {
            try {
                const responseUSER = await fetch(`${apiBaseUrl}/api/auth/get_user/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const datauser = await responseUSER.json();

                commit('setDepartmentID', datauser.data.departement_id);
                commit('setusername', datauser.data.name);
                commit('setrole', datauser.data.roles);

                if (datauser.data.name_departement === null) {
                    commit('setDepartmentName', 'Admin');
                } else {
                    commit('setDepartmentName', datauser.data.name_departement);
                }
            } catch (error) {
                console.error('Error fetching department data:', error);
                // Handle errors as needed
            }
        }
    }
});

export default store;