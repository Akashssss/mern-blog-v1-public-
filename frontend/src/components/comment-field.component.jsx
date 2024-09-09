import React, { useContext, useState } from 'react'
import { UserContext } from '../App';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { BlogContext } from '../pages/blog.page';
export default function CommentField({ action,index=undefined,replyingTo=undefined ,setReplying }) {
    const [comment, setComment] = useState("");


    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);
    let {
        blog,
        setBlog,
        blog: { _id,
            author: {
                _id: blog_author },
            comments,
            comments :{results:commentsArr},
            activity,
            activity: {
                total_comments,
                total_parent_comments } },
        totalParentCommentsLoaded,
        setTotalParentCommentsLoaded } = useContext(BlogContext);


    const handleComment = async () => {
        if (!access_token)
            return toast.error("Login first to leavea comment.");
        if (!(comment.trim().length)) {
            return toast.error("Write something to leave a comment.");
        }

        try {

            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/add-comment',
                { _id, blog_author, comment, replying_to:replyingTo },
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
            console.log(data);


            setComment('');
            //todo: get the commenteBy through the frontend using userContext but that not it should be  to be a modular it should be came from the backend . 

            data.commented_by = {
                personal_info: {
                    username,
                    profile_img,
                    fullname
                }
            };

            let newCommentArr;
            if(replyingTo){
                commentsArr[index].children.push(data._id) ;
                data.childrenLevel = commentsArr[index].childrenLevel+1 ; 
                data.parentIndex = index ; 
                commentsArr[index].isReplyLoaded=true ;  
                commentsArr.splice(index+1, 0 ,data) ; 
                newCommentArr=commentsArr;
                setReplying(false) ;

            }else{
                data.childrenLevel = 0;
                newCommentArr = [data,...commentsArr];
            }
           
            let parentCommentIncrementVal =replyingTo?0: 1;
            setBlog({
                ...blog,
                comments: { ...comments, results: newCommentArr },
                activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementVal }
            })


            setTotalParentCommentsLoaded(prev => prev + parentCommentIncrementVal);


        } catch (error) {
            console.log(error, error.message)
        }
    }
    return (
        <>
            <Toaster />
            <textarea
                value={comment}
                placeholder='Leave a comment...'
                className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto'
                onChange={(e) => { setComment(e.target.value) }}>

            </textarea>
            <button
                className='btn-dark mt-5 px-10 '
                onClick={handleComment}>
                {action}
            </button>

        </>
    )
}
