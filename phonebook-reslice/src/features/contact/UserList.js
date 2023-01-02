import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { loadContactAsync, selectContact, addContactAsync, deleteContactAsync } from "./contactSlice";
import UserItem from '../../component/UserItem'

export default function UserList(props) {
    const contact = useSelector(selectContact)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadContactAsync())
    }, [dispatch])

    const scrolling = (event) => {
        var element = event.target;
        if (element.scrollHeight - element.scrollTop - element.clientHeight <= 1) {
            // dispatch(loadMore())
        }
    }

    return (
        <div onScroll={scrolling} className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 px-2 max-h-screen overflow-y-auto h-107">
            {
                contact.map((user, index) => (
                    <UserItem key={user.id} users={user} sent={user.sent} resend={() => dispatch(addContactAsync(user.id, user.name, user.phone))} remove={() => dispatch(deleteContactAsync(user.id))} />
                ))
            }
        </div>
    )
}