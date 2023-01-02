import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadContact, addContact, removeContact } from './contactAPI';

const initialState = {
    value: [],
    status: 'idle',
};

export const loadContactAsync = createAsyncThunk(
    'contact/loadContact',
    async () => {
        const { data } = await loadContact();
        console.log(data.data.users)
        return data.data.users;
    }
);

export const addContactAsync = createAsyncThunk(
    'contact/addContact',
    async (id, name, phone) => {
        const { data } = await addContact(name, phone);
        return {
            id,
            contact: data.data
        };
    }
);

export const deleteContactAsync = createAsyncThunk(
    'contact/deleteContact',
    async (id) => {
        const { data } = await removeContact(id);
        console.log(data.data.users.id)
        return data?.data?.users.id;
    }
);


export const contactSlice = createSlice({
    name: 'contact',
    initialState,
    reducers: {
        add: (state, action) => {
            console.log(action)
            state.value = {
                ...state,
                data: [...state.data, {
                    id: action.payload.id,
                    name: action.payload.name,
                    phone: action.payload.phone,
                    sent: true
                }]
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addContactAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.value = {
                    ...state,
                    data: state.data.map(item => {
                        if (item.id === action.payload.id) {
                            return {
                                id: action.payload.users.id,
                                name: action.payload.users.name,
                                phone: action.payload.users.phone,
                                sent: true
                            }
                        }
                        return item
                    })
                };
            })
            .addCase(deleteContactAsync.fulfilled, (state, action) => {
                state.value = {
                    ...state,
                    data: state.data.filter(item => item.id !== action.payload.id)
                }
            });
    },
});

export const { add } = contactSlice.actions;

export const selectContact = (state) => state.contact.value;

export const create = (name, phone) => (dispatch, getState) => {
    const id = Date.now()
    dispatch(add({ id, name, phone }))
    dispatch(addContactAsync(id))
};


export default contactSlice.reducer;