import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadContact, addContact, removeContact, updateContact } from './contactAPI';

import axios from 'axios';

const url = axios.create({
    baseURL: 'http://localhost:3002/',
    timeout: 1000,
    headers: { 'Authorization': 'token' }
})

const initialState = {
    value: {
        data: [],
        params: {
            page: 1,
            pages: 0
        }
    },
    status: 'idle',
};

export const loadContactAsync = createAsyncThunk(
    'contact/loadContact',
    async () => {
        try {
            const { data } = await loadContact();
            return { data: data.data.users, page: data.data.page, pages: data.data.pages };
        } catch (error) {
            console.log(error)
        }
    }
);

export const addContactAsync = createAsyncThunk(
    'contact/addContact',
    async ({ id, name, phone }) => {
        try {
            const { data } = await addContact(name, phone);
            return { success: true, id, data: data.data }
        } catch (error) {
            return { success: false, id }
        }
    }
);

export const updateContactAsync = createAsyncThunk(
    'contact/updateContact',
    async ({ id, name, phone }) => {
        try {
            const { data } = await updateContact(id, name, phone)
            return ({ success: true, id, data: data.data })
        } catch (error) {
            alert('Failed to update data')
            console.log(error)
        }
    }
)

export const removeContactAsync = createAsyncThunk(
    'contact/removeContact',
    async ({ id }) => {
        try {
            const { data } = await removeContact(id);
            return { id, data: data.data }
        } catch (error) {
            alert('Failed to remove data')
            console.log(error)
        }
    }
);


export const contactSlice = createSlice({
    name: 'contact',
    initialState,
    reducers: {
        add: (state, action) => {
            state.value = {
                ...state.value,
                data: [...state.value.data, {
                    id: action.payload.id,
                    name: action.payload.name,
                    phone: action.payload.phone,
                    sent: true
                }]
            }
        },
        loadPage: (state, action) => {
            state.value = {
                data: [...state.value.data, ...action.payload.value.map(item => {
                    item.sent = true
                    return item
                })],
                params: action.payload.params
            }
        },
        update: (state, action) => {
            state.value = {
                data: [
                    ...state.value.data,
                    {
                        id: action.payload.id,
                        name: action.payload.name,
                        phone: action.payload.phone,
                        sent: true
                    }
                ]
            }
        },
        searchContact: (state, action) => {
            state.value = {
                data: action.payload.value.map(item => {
                    item.sent = true
                    return item
                }),
                params: action.payload.params
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadContactAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(loadContactAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.value = {
                    data: action.payload.data.map(item => {
                        item.sent = true
                        return item
                    }),
                    params: {
                        page: action.payload.page,
                        pages: action.payload.pages
                    }
                }
            })
            .addCase(addContactAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addContactAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                if (action.payload.success) {
                    state.value = {
                        ...state.value,
                        data: state.value.data.map(item => {
                            if (item.id === action.payload.id) {
                                return {
                                    id: action.payload.data.id,
                                    name: action.payload.data.name,
                                    phone: action.payload.data.phone,
                                    sent: true
                                }
                            }
                            return item
                        })
                    }
                } else {
                    state.value = {
                        ...state,
                        data: [...state.value.data.map(item => {
                            if (item.id === action.payload.id) {
                                return {
                                    ...item,
                                    sent: false
                                }
                            }
                            return item
                        })]
                    }
                }
            })
            .addCase(updateContactAsync.fulfilled, (state, action) => {
                state.status = 'idle'
                state.value = {
                    ...state.value,
                    data: state.value.data.map(item => {
                        if (item.id === action.id) {
                            return {
                                id: action.payload.data.id,
                                name: action.payload.data.name,
                                phone: action.payload.data.phone,
                                sent: true
                            }
                        }
                        return item
                    })
                }
            })
            .addCase(removeContactAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.value = {
                    ...state.value,
                    data: state.value.data.filter(item => item.id !== action.payload.id)
                }
            })
    },
});

export const { add, loadPage, searchContact } = contactSlice.actions;

export const selectContact = (state) => state.contact.value.data;

export const loadMore = () => {
    return async (dispatch, getState) => {
        try {
            let state = getState()
            if (state.contact.value.params.page <= state.contact.value.params.pages) {
                let params = {
                    ...state.contact.value.params,
                    page: state.contact.value.params.page + 1
                }
                const { data } = await url.get('users', { params })
                params = {
                    ...params,
                    pages: data.data.pages
                }
                dispatch(loadPage({ value: data.data.users, params }))
            }
        } catch (error) {
            console.log(error)
        }
    }
}

export const create = (name, phone) => {
    return async (dispatch, getState) => {
        const id = Date.now()
        dispatch(add({ id, name, phone }))
        dispatch(addContactAsync({ id, name, phone }))
    };
}

export const update = (name, phone) => {
    return async (dispatch, getState) => {
        const id = Date.now()
        dispatch(update({ id, name, phone }))
        dispatch(updateContactAsync({ id, name, phone }))
    }
}

export const search = (searchName, searchPhone) => {
    return async (dispatch, getState) => {
        let state = getState()
        let params = {
            ...state.contact.value.params,
            searchName,
            searchPhone,
            page: 1
        }
        const { data } = await url.get('users', { params })
        params = {
            ...params,
            pages: data.data.pages
        }
        dispatch(searchContact({ value: data.data.users, params }))
    }
}

export default contactSlice.reducer;