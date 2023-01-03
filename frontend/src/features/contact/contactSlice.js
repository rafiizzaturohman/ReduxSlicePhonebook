import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadContact, addContact, removeContact, updateContact } from './contactAPI';

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
        const response = await loadContact();
        return { data: response.data.data.users, page: response.data.data.page, pages: response.data.data.pages };
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

export const removeContactAsync = createAsyncThunk(
    'contact/removeContact',
    async ({ id }) => {
        const response = await removeContact(id);
        return response?.data?.data?.id
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
            .addCase(removeContactAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.value = {
                    ...state.value,
                    data: state.value.data.filter(item => item.id !== action.payload)
                }
            })
    },
});

export const { add } = contactSlice.actions;

export const selectContact = (state) => state.contact.value.data;

export const load = () => (dispatch, getState) => {
    dispatch(loadContactAsync())
};

export const create = (name, phone) => (dispatch, getState) => {
    const id = Date.now()
    dispatch(add({ id, name, phone }))
    dispatch(addContactAsync({ id, name, phone }))
};


export default contactSlice.reducer;