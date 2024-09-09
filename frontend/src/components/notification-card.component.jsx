import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom';
import { getDay } from '../common/date';
import NotificationCommentField from './notification-comment-field.component';
import { UserContext } from '../App';
import axios from 'axios';

export default function NotificationCard({data, index ,notificationState}) {

 let [isReplying , setReplying] =useState(false) ;

  let {seen,reply,createdAt,comment,replied_on_comment,type ,user,user:{personal_info:{fullname,username,profile_img}}, blog:{_id ,blog_id ,title},_id:notification_id} = data ; 
  let  {userAuth:{username:author_username , profile_img:author_profile_img , access_token}} =useContext(UserContext) ;
   let {notifications ,notifications:{results,totalDocs} , setNotifications}=notificationState ;
  const handleReplyClick= ()=>{
   setReplying((prev)=>!prev) ; 
  }

  const handleDelete =(comment_id , type ,target)=>{
   target.setAttribute('disabled',true) ; 
   axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/delete-comment',{_id:comment_id},{
    headers: {
        'Authorization': `Bearer ${access_token}`
    }
   }).then(()=>{
    if(type=='comment'){
        results.splice(index,1 ) ;
    }else{
         delete results[index].reply ;
    }
    target.removeAttribute('disabled') ;
    setNotifications({...notifications , results, totalDocs:totalDocs-1 ,deleteDocCount:notifications.deleteDocCount+1})
   }).catch(err=>{
    console.log(err) ;
   })
   
  }
  return (
    <div className={`p-6 border-b border-grey border-l-black  ${!seen?"border-l-2":""}`}>
        <div className='flex gap-5 mb-3 '>
             <img src={profile_img} className='w-14 h-14 flex-none rounded-full' alt="" />
             <div className='w-full '>
                  <h1 className='font-medium text-xl text-dark-grey'>
                    <span className='lg:inline-block hidden capitalize'>{fullname}</span>
                    <Link className='mx-1 text-black underline' to={`/user/${username}`}>@{username}</Link>
                    <span className='font-normal'>
                        {
                            type=='like'?'liked your blog':
                            type=='comment'?'commented on your blog':
                            "replied to your blog"
                        }
                    </span>
                  </h1>
                  {
                    type=='reply'?
                    <div className='p-4 mt-4 rounded-md bg-grey'>
                        <p>{replied_on_comment.comment}</p>
                    </div>:
                    <Link className='font-medium tex-dark-grey hover:underline line-clamp-1' to={`/blog/${blog_id}`}>{
                        `"${title}"`
                    }
                    </Link>
                  }
             </div>
        </div>
        {
            type!='like'?

            <p className='ml-14 pl-5 font-gelasio text-xl my-5 '>{comment.comment}</p>:""
        }

        <div className='ml-12 pl5 mt-3 text-dark-grey flex gap-8 '>
            <p>{getDay(createdAt)}</p>
            {
                type!='like'?
                <>
                {
                    !reply?
                    <button
                onClick={handleReplyClick}
                 className='underline hover:text-black '>Reply</button>:""
                }
                <button 
                onClick={(e)=>{handleDelete(comment._id ,"comment" ,e.target)}}
                className='underline hover:text-black'>Delete</button>
                </>:""
            }
        </div>
        {
            isReplying ? 
            <div className='mt-8'>
                 <NotificationCommentField
                 _id={_id}
                 blog_author={user}
                 index={index}
                 replyingTo={comment._id}
                 setReplying={setReplying}
                 notification_id={notification_id}
                 notificationData={notificationState}
                 />
            </div>:""
            
        }
        {
            reply?
            <div className='ml-20 p-5 bg-grey mt-5 rounded-md '>
                <div className='flex gap-3 mb-3'>
                     <img className='w-8 h-8 rounded-full ' src={author_profile_img}/>
                     <div>
                        <h1 className='font-medium text-xl '>
                            <Link 
                            to={`/user/${author_username}`}
                            className='mx-1 text-black'
                            >@{author_username}</Link>
                            <span className='font-normal '>replied to</span>
                            <Link 
                            to={`/user/${author_username}`}
                            className='mx-1 text-black'
                            >@{username}</Link>
                        </h1>
                     </div>
                </div>
                <p className='ml-14 font-gelasio text-xl my-2'>{reply.comment}</p>
                <button 
                onClick={(e)=>{handleDelete(reply._id ,"reply" ,e.target)}}
                className='underline hover:text-black ml-14'>Delete</button>

            </div>
            :""
        }

    </div>
  )
}
