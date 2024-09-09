import React, { createContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { getDay } from '../common/date';
import BlogIntraction from '../components/blog-interaction.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer, { fetchComments } from '../components/comments.component';


export const blogStructure = {
    title: '',
    des: '',
    content: [],
    author: {
        personal_info: {
            fullname: '',
            username: '',
            profile_img: ''
        }
    },
    banner: '',
    publishedAt: '',

}

export const BlogContext = createContext({});

export default function BlogPage() {




    const { blog_id } = useParams();
    const [blog, setBlog] = useState(blogStructure);
    const [similarBlogs, setSimilarBlogs] = useState(null);
    const { title,
        des,
        banner,
        content,
        author: { personal_info: { fullname, username: author_username, profile_img } },
        publishedAt,
    } = blog;
    // console.log(author_username) ;
    const [loading, setLoading] = useState(true);
    const [isLikedByUser, setLikedByUser]= useState(false) ;  
    const [commentWrapper , setCommentWrapper] = useState(false) ; 
    const [totalParentCommentsLoaded , setTotalParentCommentsLoaded] = useState(0) ; 








    const fetchBlog = async () => {
        try {  
            console.log("inside the fetch blog")
            const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, { blog_id });
             console.log("befor -->\n",data.blog )
            data.blog.comments = await fetchComments({blog_id:data.blog._id ,setParentCommentCountFun: setTotalParentCommentsLoaded })
            setBlog(data.blog);
            console.log("after--> \n",data.blog);
            const { data: similarBlogData } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, { tag: data.blog.tags[0], limit: 6, eliminateBlog: blog_id })

            setSimilarBlogs(similarBlogData.blogs);  // get 6 similar blogs
            console.log(similarBlogData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching blog:', error.message);
        }
    };

    useEffect(() => {
        resetState();
        fetchBlog();
    }, [blog_id]);

    const resetState = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setLikedByUser(false) ;
      //  setCommentWrapper(false) ;
        setTotalParentCommentsLoaded(0) ;
    }


    return (
        <div>
            <AnimationWrapper>
                {
                    loading ? <Loader /> :
                        <BlogContext.Provider value={{ blog, setBlog ,isLikedByUser, setLikedByUser , commentWrapper, setCommentWrapper , totalParentCommentsLoaded ,setTotalParentCommentsLoaded }}>

                            <CommentsContainer/>
                            <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
                                <img src={banner} className='aspect-video' />

                                <div className='mt-12 break-words'>
                                    <h2 className=''>{title}</h2>

                                    <div className='flex max-sm:flex-col justify-between my-8'>
                                        <div className='flex gap-5 items-start '>
                                            <img src={profile_img} className='w-12 h-12 rounded-full ' />
                                            <p className='capitalize'>
                                                {fullname}
                                                <br />
                                                @
                                                <Link to={`/user/${author_username}`} className="underline">{author_username}</Link>
                                            </p>
                                        </div>
                                        <p className='text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12'>Published on {getDay(publishedAt)} </p>
                                    </div>
                                </div>

                                <BlogIntraction />

                                {/* blog content will go over here*/}

                                <div className='my-12 font-galasio blog-page-content  '>
{
    content[0].blocks.map((block , i)=>{
       return <div key ={i} className='my-4'>
        <BlogContent  block={block}/>
       </div>
    })
}
                                </div>

                                <BlogIntraction />


                                {

                                    similarBlogs && similarBlogs.length ?
                                        <>
                                            <h1 className='text-2xl mt-14 mb-10 font-medium'>Similar Blogs</h1>
                                            {
                                                similarBlogs.map((blog, i) => {

                                                    let { author: { personal_info } } = blog;
                                                    return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>

                                                        <BlogPostCard content={blog} author={personal_info} />
                                                    </AnimationWrapper>

                                                })
                                            }
                                        </>
                                        :
                                        ""
                                }
                            </div>
                        </BlogContext.Provider>
                }
            </AnimationWrapper>
        </div>
    );
}
