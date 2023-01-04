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
            const response = await loadContact();
            return { data: response.data.data.users, page: response.data.data.page, pages: response.data.data.pages };
        } catch (error) {
            console.log(error)
        }
    }
);

export const addContactAsync = createAsyncThunk(
    'contact/addContact',
    async ({ id, name, phone }) => {
        try {
            const response = await addContact(name, phone);
            return { success: true, id, data: response.data.data }
        } catch (error) {
            return { success: false, id }
        }
    }
);

export const updateContactAsync = createAsyncThunk(
    'contact/updateContact',
    async ({ id, name, phone }) => {
        try {
            const response = await updateContact(id, name, phone)
            return { id, data: response.data.data }
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
            const response = await removeContact(id);
            console.log(response.data.data)
            return response.data.data
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
        loadPage: (state, action) => {
            state.value = {
                data: [...state.value.data, ...action.payload.value.map(item => {
                    item.sent = true
                    return item
                })],
                params: action.payload.params
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
                        page: action.page,
                        pages: action.pages
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
                        data: [...state.value.data.map(item => {
                            if (item.id === action.payload.id) {
                                return {
                                    id: action.payload.data.id,
                                    name: action.payload.data.name,
                                    phone: action.payload.data.phone,
                                    sent: true
                                }
                            }
                            return item
                        })]
                    };
                } else {
                    state.value = {
                        ...state.value,
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
                    data: [...state.value.data.map(item => {
                        if (item.id === action.payload.id) {
                            return {
                                id: action.payload.data.id,
                                name: action.payload.data.name,
                                phone: action.payload.data.phone,
                                sent: true
                            }
                        }
                        return item
                    })]
                }
            })
            .addCase(removeContactAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.value = {
                    ...state.value,
                    data: state.value.data.filter(item => item.id !== action.id)
                }
            })
    },
});

export const { add, loadPage, searchContact } = contactSlice.actions;

export const selectContact = (state) => state.contact.value.data;

export const load = () => (dispatch, getState) => {
    dispatch(loadContactAsync())
};

export const loadMore = () => (dispatch, getState) => {
    let state = getState()
    if (state.contact.value.params.page <= state.contact.value.params.pages) {
        let params = {
            ...state.contact.value.params,
            page: state.contact.value.params.page + 1
        }
        url.get('users', { params }).then(({ data }) => {
            params = {
                ...params,
                pages: data.data.pages
            }
            dispatch(loadPage({ value: data.data.users, params }))
        })
    }
};

export const create = (name, phone) => (dispatch, getState) => {
    const id = Date.now()
    dispatch(add({ id, name, phone }))
    dispatch(addContactAsync({ id, name, phone }))
};

export const update = (name, phone) => (dispatch, getState) => {
    const id = Date.now()
    dispatch(updateContact({ id, name, phone }))
    dispatch(updateContactAsync({ id, name, phone }))
};

export const search = (searchName, searchPhone) => (dispatch, getState) => {
    let state = getState()
    let params = {
        ...state.contact.value.params,
        searchName,
        searchPhone,
        page: 1
    }
    url.get('users', { params }).then(({ data }) => {
        params = {
            ...params,
            pages: data.data.pages
        }
        dispatch(searchContact({ value: data.data.users, params }))
    })
}


export default contactSlice.reducer;