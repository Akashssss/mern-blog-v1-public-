import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import InPageNavigation from '../components/inpage-navigation.component'
import Loader from '../components/loader.component';
import AnimationWrapper from '../common/page-animation';
import BlogPostCard from '../components/blog-post.component';
import LoadMoreDataBtn from '../components/load-more.component';
import filterPaginationData from '../common/filter-pagination-data';
import NoDataMessage from '../components/nodata.component';
import axios from 'axios';
import UserCard from '../components/usercard.component';
export default function SearchPage() {
    let { query } = useParams();
    let [blogs, setBlogs] = useState(null);
    let [users , setUsers] = useState(null);

    const fetchUsers = async ()=>{
       const {data} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users" ,{query});
       setUsers(data.users) ;
       console.log(users) ; 
    }
    const searchBlogs = async ({ page = 1, create_new_arr = false }) => {



        try {
            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page })


            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { query },
                create_new_arr

            })
            console.log(formatedData);
            setBlogs(formatedData);


        } catch (error) {
            console.log(error);
        }

       
    }
    useEffect(()=>{
        resetState() ;
        console.log("hello use effect!");
        searchBlogs({page:1, create_new_arr:true}); 
        fetchUsers(); 
    },[query]);
    const resetState = ()=>{
        setBlogs(null);
        setUsers(null);
    }
    console.log(users)

    const UserCardWrapper=()=>{
        return (
            <>
            {
                users ===null ?
                <Loader />
                :
                (
                    users.length?
                users.map((user,i)=>{
                    return <AnimationWrapper key={i} transition={{duration:1 ,delay:i*0.08}}>
                        
                       <UserCard  user = {user}/>
                       </AnimationWrapper>
                })
                :<NoDataMessage message ="No user found" />
                )
                
            }
            
            </>
        )
    }
    return (
        <section className='h-cover flex justify-center gap-10 '>

            <div className='w-full '>

                <InPageNavigation routes={[`Search results from ${query}`, "Accounts matched"]} defaultHidden={["Accounts matched"]}>
                    <>
                        {
                            (blogs == null) ?
                                <Loader />
                                :
                                ((blogs.results.length)
                                    ? (
                                        blogs.results.map((blog, i) => {
                                            return <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                                                <BlogPostCard content={blog} author={blog.author.personal_info} />
                                            </AnimationWrapper>
                                        }))
                                    : (<NoDataMessage message="No blogs published" />))

                        }
                        <LoadMoreDataBtn  state={blogs} fetchDataFunc={searchBlogs}/>
                    </>
                    <UserCardWrapper/>
                </InPageNavigation>

            </div>

            <div className='min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden '>
                  <h1 className='font-medium text-xl mb-8'>
                         User related to search  
                         <i className='fi fi-rr-user ml-1 mt-1 '></i>                       
                  </h1>
                  <UserCardWrapper/>
            </div>
        </section>
    )
}
