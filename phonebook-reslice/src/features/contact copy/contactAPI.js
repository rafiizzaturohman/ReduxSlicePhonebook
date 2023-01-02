import axios from 'axios';

const url = axios.create({
    baseURL: 'http://localhost:3002/',
    timeout: 1000,
    headers: { 'Authorization': 'token' }
})

export const loadContact = () => url.get('users')

export const addContact = (name, phone) => url.post('users', { name, phone })

export const updateContact = (id, name, phone) => url.put(`users/${id}`, { name, phone })

export const removeContact = (id) => url.delete(`users/${id}`)