import React, { useContext, useState } from 'react'
import { getDay } from '../common/date';
import { UserContext } from '../App';
import toast from 'react-hot-toast';
import CommentField from './comment-field.component';
import { BlogContext } from '../pages/blog.page';
import axios from 'axios';

export default function CommentCard({ index, leftVal, commentData }) {


    let { commented_by: { personal_info: { profile_img, fullname, username:commented_by_username } }, comment, commentedAt, _id ,children} = commentData;
    const [isReplying, setReplying] = useState(false);

    let { userAuth: { access_token,username } } = useContext(UserContext);
    let {blog,blog:{comments ,activity,comments:{results:commentsArr}, activity :{total_parent_comments}, author:{personal_info:{username:blog_author}} },setBlog , setTotalParentCommentsLoaded}=useContext(BlogContext) ; 


    const handleReplyClick = async () => {
        if (!access_token)
            return toast.error("Login first to leave a reply.");

        setReplying(prev => !prev);

    }
    const getParentIndex=()=>{
        let startingPoint = index-1 ; 
        try {
            
            while(commentsArr[startingPoint].childrenLevel>commentData.childrenLevel){
                startingPoint--;
            }
        } catch (error) {
            startingPoint=undefined;
        }
        return startingPoint ;
    }

    const removeCommentsCards =(startingPoint , isDelete=false) =>{
         if(commentsArr[startingPoint]){
            while(commentsArr[startingPoint].childrenLevel>commentData.childrenLevel){
                commentsArr.splice(startingPoint, 1);
                 if(!commentsArr[startingPoint])
                    break;
            }
         }
         if(isDelete)
         {
            let parentIndex = getParentIndex() ; 
            if(parentIndex){
                commentsArr[parentIndex].children
                = commentsArr[parentIndex].children
                .filter(child=>child!=_id) ; 
                if(commentsArr[parentIndex].children.length){
                    commentsArr[parentIndex].isReplyLoaded=false ;
                }
            }
            commentsArr.splice(index ,1) ; 
         }
         if(commentData.childrenLevel==0 && isDelete)
         {
            setTotalParentCommentsLoaded(prev=>prev-1) ; 
         }
         setBlog({...blog , 
             comments:{results:commentsArr},
             activity:{
                ...activity,
                total_parent_comments: 
                total_parent_comments-(commentData.childrenLevel==0 && isDelete?1:0)
             }
        }); 
    }

    const hideReplies =() =>{
        commentData.isReplyLoaded= false  ; 
        removeCommentsCards(index+1) ; 
    }
    
    const loadReplies=({skip=0})=>{
      if(children.length)
      {
        hideReplies() ;
        axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/get-replies',
            {_id, skip})
            .then(({data:{replies}})=>{
                commentData.isReplyLoaded= true ;
                for(let i =0 ;i<replies.length ;i++)
                {
                    replies[i].childrenLevel = commentData.childrenLevel + 1 ;
                    
                    commentsArr.splice(index+1+i+skip, 0, replies[i]);
                }
                setBlog({...blog, comments:{...comments , results:commentsArr}})
            }).catch(
                (error)=>{
                    console.log(error) ; 
                }
            )

      }
    }

    const deleteComment = (e)=>{
           e.target.setAttribute('disabled',true) ; 
           axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/delete-comment',{_id} ,{
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
           }).then(()=>{
            e.target.removeAttribute('disabled') ; 
            removeCommentsCards(index+1, true)  ;
           })
           .catch(error=>{
            console.log(error) ;  // handle error here
            // toast.error("Failed to delete comment.") ;
           })
           
    }



    return (

        <div className='w-full'
            style={{ paddingLeft: `${leftVal * 10}px` }}>

            <div className='my-5 p-6 rounded-md border border-grey '>
                <div className='flex gap-3 items-center my-8 '>
                    <img src={profile_img} className='w-6 h-6 rounded-full' />
                    <p className='line-clamp-1 min-w-fit'>{fullname} @{commented_by_username}</p>
                    <p>{getDay(commentedAt)}</p>
                </div>
                <p className='font-gelasio text-xl ml-3'>{comment}</p>
                <div className='flex gap-5  ml-3 mt-3'>
                    {
                       commentData.isReplyLoaded ?
                       <button 
                       onClick={hideReplies}
                        className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'>
                         <i className='fi fi-rs-comment-dots'></i>Hide reply
                       </button>
                       :
                       <button 
                        onClick={loadReplies}
                        className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'>
                         <i className='fi fi-rs-comment-dots'></i>{children.length} reply
                       </button>
                       
                    }
                    <button
                        onClick={handleReplyClick}
                        className='underline'>Reply</button>
                    {
                        (username==commented_by_username||username == blog_author) &&
                        <button
                        onClick={deleteComment}
                        className='p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/50 hover:text-red flex items-center'>
                            <i className='fi fi-rr-trash'></i>
                        </button>
                    }
                </div>
                {
                    isReplying &&
                    <div className='mt-8'>
                        <CommentField action="reply" index={index} replyingTo={_id} setReplying={setReplying} />
                    </div>
                }
            </div>
        </div>
    )
}
