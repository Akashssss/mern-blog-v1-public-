import React, { useContext, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { UserContext } from '../App';
import axios from 'axios';

export default function NotificationComment({_id ,blog_author ,index=undefined , replyingTo=undefined, setReplying, notification_id, notificationData}) {
let {_id:user_id}=blog_author;
let {userAuth:{access_token}}=useContext(UserContext) ;
let {notifications, notifications:{results} , setNotifications}=notificationData ;
    let [comment ,setComment] = useState('');


    const handleComment=async ()=>{

        if (!(comment.trim().length)) {
            return toast.error("Write something to leave a comment.");
        }

        try {

            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/add-comment',
                { _id, blog_author:user_id, comment, replying_to:replyingTo,notification_id },
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
            console.log(data);

             setReplying(false) ;
             results[index].reply={comment,_id:data._id} ;
             setNotifications({...notifications, results}) ;
            setComment('');
            //todo: get the commenteBy through the frontend using userContext but that not it should be  to be a modular it should be came from the backend . 


           

        } catch (error) {
            console.log(error, error.message)
        }
    }
    return (
        <>
            <Toaster />
            <textarea
                value={comment}
                placeholder='Leave a reply...'
                className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto'
                onChange={(e) => { setComment(e.target.value) }}>

            </textarea>
            <button
                className='btn-dark mt-5 px-10 '
                onClick={handleComment}>
                Reply
            </button>

        </>
    )
}
