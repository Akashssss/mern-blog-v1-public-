import React, { useContext } from 'react'
import { BlogContext } from '../pages/blog.page'
import CommentField from './comment-field.component'
import axios from 'axios' ;
import NoDataMessage from './nodata.component';
import AnimationWrapper from '../common/page-animation';
import CommentCard from './comment-card.component';





export const fetchComments = async ({skip=0 , blog_id, setParentCommentCountFun , comments_arr = []  }) =>{
  let res ; 
 try { const {data} = await axios.post (import.meta.env.VITE_SERVER_DOMAIN + '/get-blog-comments',{blog_id , skip}) ; 
 data.map((comment)=>{
   comment.childrenLevel = 0 ; 
 });
 setParentCommentCountFun(prevVal=>prevVal+ data.length) ; 
   if(comments_arr ==null){
     res = {results:data} ; 
   }
   else {
       res = {results:[...comments_arr , ...data]}
   }
return res ;
    
 } catch (error) {
    console.log(error) ;
 }

return res ; 
}




export default function CommentsContainer() {

    const { blog:{_id ,title, comments:{results :commentsArr} ,
activity :{total_parent_comments}} ,commentWrapper, setCommentWrapper,
        totalParentCommentsLoaded, setTotalParentCommentsLoaded,
        blog , setBlog
    } = useContext(BlogContext) ; 


    const loadMoreComments = async()=>{
        let newCommentsArr = await fetchComments({skip:totalParentCommentsLoaded,blog_id:_id ,setParentCommentCountFun:setTotalParentCommentsLoaded , comments_arr:commentsArr }) ;
        setBlog({...blog ,comments: newCommentsArr}) ;
    }








    return (
        <div className={` max-sm:w-full fixed  
        ${commentWrapper ?" sm:right-0 top-0 ":" top-[100%]    sm:right-[-100%] "} duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-[50] bg-white shadow-2xl p-8 px-10 overflow-y-auto overflow-x-hidden `}>
 {/* // todo : on resizing the screen the comments transition shown from right to bottom but it should be disappear immidiately .
  */}

            <div className='relative'>
                <h1 className='text-xl font-medium'>Comments</h1>
                <p className='text-lg mt-2 w-[70%] text-dark-grey line-clamp-1'>{title}</p>
                <button className='absolute top-0 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-grey'
                 onClick={()=>setCommentWrapper((prev)=>!prev)}
                >
                    <i className='fi fi-br-cross text-sm mt-1'></i>
                </button>
            </div>
            <hr  className='border-grey my-8 w-[100%] '/>

            <CommentField action ="comment"/>



            {
              commentsArr && commentsArr.length ? 
              commentsArr.map((comment , i)=>{
                return <AnimationWrapper key ={i}>
                           <CommentCard 
                           index={i}
                           leftVal={comment.childrenLevel*4} 
                           commentData={comment}
                            />
                         </AnimationWrapper> ; 

              })
              :<NoDataMessage message ="No comments"/> 
            }
            {
                (total_parent_comments >totalParentCommentsLoaded)?
                <button 
                onClick={loadMoreComments}
                className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md items-center gap-2 '>
                       Load more
                </button>:""
                
            }

        </div>
    )
}
