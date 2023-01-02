import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import contactReducer from '../features/contact/contactSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    contact: contactReducer
  },
});
