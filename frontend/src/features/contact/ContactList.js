import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { loadContactAsync, addContactAsync, removeContactAsync, updateContactAsync, selectContact, loadMore } from './contactSlice'
import ContactItem from '../../component/ContactItem'

export default function ContactList(props) {
    const contact = useSelector(selectContact)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadContactAsync())
    }, [dispatch])

    const scrolling = (event) => {
        var element = event.target;
        if (element.scrollHeight - element.scrollTop - element.clientHeight <= 1) {
            dispatch(loadMore())
        }
    }

    return (
        <div onScroll={scrolling} className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 px-2 max-h-screen overflow-y-auto h-107">
            {
                contact.map((user, index) => (
                    <ContactItem
                        key={user.id}
                        users={user}
                        sent={user.sent}
                        resend={() => dispatch(addContactAsync({ id: user.id, name: user.name, phone: user.phone }))}
                        update={(name, phone) => dispatch(updateContactAsync({ id: user.id, name: name, phone: phone }))}
                        remove={() => dispatch(removeContactAsync({ id: user.id }))} />
                ))
            }
        </div>
    )
}