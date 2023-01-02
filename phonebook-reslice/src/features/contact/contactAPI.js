import axios from 'axios';

const url = axios.create({
    baseURL: 'http://localhost:3002/',
    timeout: 1000,
    headers: { 'Authorization': 'token' }
})

export const loadContact = async () => await url.get('users')

export const addContact = async (name, phone) => await url.post('users', { name, phone })

export const updateContact = async (id, name, phone) => await url.put(`users/${id}`, { name, phone })

export const removeContact = async (id) => await url.delete(`users/${id}`)