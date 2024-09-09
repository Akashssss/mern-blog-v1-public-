import React, { useContext, useEffect } from 'react'
import { BlogContext } from '../pages/blog.page'
import { Link } from 'react-router-dom'
import { UserContext } from '../App';
import {Toaster ,toast } from 'react-hot-toast' ;
import axios from 'axios' ; 
export default function BlogIntraction() {

    let {blog ,
        blog :{title,_id,
            blog_id,
            activity , activity:{total_likes ,total_comments},
            author :{
               personal_info :{username:author_username} 
            }
        } ,
        setBlog ,isLikedByUser, setLikedByUser,
        commentWrapper, setCommentWrapper
    } = useContext(BlogContext) ;
  
    let {userAuth:{username, access_token}} =useContext(UserContext) ;

    useEffect(()=>{
      if(access_token){
         //make server request for like information
         axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/isLiked-by-user' ,{
          _id } ,{headers:{
            'Authorization': `Bearer ${access_token}`
          }}).then(({data:{result}})=>{
            console.log(result) ; 
            setLikedByUser(Boolean(result)) ;
          }).catch((err)=>
          console.log('error',err))
      }
    },[])
  // console.log(blog)
  console.log(blog_id) ;
const handleLike=async ()=>{


try {
  if(access_token){
    setLikedByUser(prev=>!prev) ;
    !isLikedByUser?total_likes++ : total_likes-- ;
    setBlog({...blog,activity:{...activity, total_likes}}) ;

      const {data} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN +'/like_blog',{
        _id , isLikedByUser
      } ,{
        headers:{
          'Authorization': `Bearer ${access_token}`
        }
      })
      console.log('liked data', data) ;
  }
  else
  toast.error("Please login to like a blog") ;
  
} catch (error) {
  console.log(error)
}
}
  return (
    <>
    <Toaster/>
    <hr  className='border-grey my-2'/> 
   <div className='flex gap-6 justify-between'>
   <div className='flex gap-3 items-center '>
       <button
        onClick={handleLike}
       className={` w-10 h-10 rounded-full  ${isLikedByUser?"bg-red/20 text-red":"bg-grey/50"}  flex justify-center items-center`}>
        <i className={`${isLikedByUser?"fi fi-sr-heart":"fi fi-rr-heart"}`}></i>
       </button>
       <p className='text-xl  text-dark-grey'>
         {total_likes} 
       </p>
       <button 
        onClick={()=>setCommentWrapper((prev)=>!prev)}
       className=' w-10 h-10 rounded-full  bg-grey/50 flex justify-center items-center'>
        <i className={`fi fi-rr-comment-dots`}></i>
       </button>
       <p className='text-xl  text-dark-grey'>
         {total_comments} 
       </p>
    </div>

    <div className='flex gap-6 items-center'>

         {
            username ==author_username ? 
            <Link to={`/editor/${blog_id}`} className = "hover:text-purple ">Edit</Link>:""
         }


        <Link to={`https://twitter.com/intent/tweet?text=Read ${title}$url=${location.href}`}>
        <i className='fi fi-brands-twitter text-xl  hover:text-twitter'>

        </i>
        </Link>
    </div>

   </div>
    <hr className='border-grey my-2 -translate-y-1/2' />
    </>
  )
}
