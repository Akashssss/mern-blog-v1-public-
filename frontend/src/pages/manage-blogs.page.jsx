import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios' ;
import { UserContext } from './../App';
import filterPaginationData from '../common/filter-pagination-data';
import { Toaster } from 'react-hot-toast';
import InPageNavigation from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
import NoDataMessage from '../components/nodata.component';
import AnimationWrapper from '../common/page-animation';
import { ManagePublishedBlogCard, MangeDraftBlogPost } from '../components/manage-blogcard.component';
import LoadMoreDataBtn from '../components/load-more.component';
import { useSearchParams } from 'react-router-dom';
export default function ManageBlogs() {
  
    const [blogs,setBlogs] = useState(null) ; 
    const[drafts, setDrafts] = useState(null) ;
    const [query, setQuery] = useState('') ; 
    let activeTab=useSearchParams()[0].get('tab') ;
    const {userAuth:{access_token}} =useContext(UserContext) ;
   
    const getBlogs = ({page, draft, deletedDocCount=0})=>{
        console.log("ehll") ;
        console.log(draft) ;
         axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/user-written-blogs' , 
            {page,draft, query, deletedDocCount},{
                headers:{
                    'Authorization': `Bearer ${access_token}`
                }

            }
         ).then(async ({data})=>{
            console.log(data) ;  // Update the user's blog status in the UserContext state
            let formatedData  = await filterPaginationData({
                state: draft? drafts: blogs ,
                data:data.blogs,
                page,user:access_token,
                countRoute:'/user-written-blogs-count',
                data_to_send:{draft,query}
            })
            console.log(formatedData) ;
            if(draft)
                setDrafts(formatedData)
            else
                setBlogs(formatedData)
         }).catch(err=>
            console.log(err)
         )
    }

    const handleChange=(e)=>{
        if(!e.target.value.length){
             setQuery('');
             setBlogs(null) ;
             setDrafts(null) ;
        }
    
    }
    const handleSearch=(e)=>{
          let searchQuery = e.target.value ;
          if(searchQuery.length)
            setQuery(searchQuery) ; 
          if(e.keyCode === 13 && searchQuery.trim().length)
          {
                 setBlogs(null) ;
                 setDrafts(null) ;
          }
    }

useEffect(()=>{
    console.log("hello")
if(access_token){
    if(blogs==null)
    {  
        getBlogs({page:1, draft:false})
    }
    if(drafts==null)
         getBlogs({page:1, draft:true}) ;
}

},[access_token,blogs , drafts, query ]);

  return (
    <>
    <h1 className="max-md:hidden">Manage blogs</h1>
    <Toaster/>
    <div className='relative max-md:mt-5 md:mt-8 mb-10'>
       <input 
       onChange={handleChange}
       onKeyDown={handleSearch}
       type="search" 
       placeholder='Search blogs' 
       className='w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey' />
       <i className='fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey '></i>
    </div>

    <InPageNavigation routes={["Published blogs" ,"Drafts"]}
     defaultActiveIndex={activeTab!='draft'?0:1}>
         {
            //published blogs 
            blogs===null?<Loader/>:
            blogs.results.length?
            <>
            {
                blogs.results.map((blog,i)=>{
                    return <AnimationWrapper key={i} transition={{delay:i*0.04}}>
                       <ManagePublishedBlogCard blog={{...blog ,setStateFunc:setBlogs }}/>
                    </AnimationWrapper>
                })
            }
            

            <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs} additionalParam={{draft:false , deletedDocCount:blogs.deletedDocCount}} />
            </>
        
            :<NoDataMessage message="No published blogs."/>
         }


{
            //Draft blogs 
            drafts===null?<Loader/>:
            drafts.results.length?
            <>
            {
                drafts.results.map((blog,i)=>{
                    return <AnimationWrapper key={i} transition={{delay:i*0.04}}>
                       <MangeDraftBlogPost blog={{...blog ,index:i,setStateFunc:setDrafts }}/>
                    </AnimationWrapper>
                })
            } <LoadMoreDataBtn state={drafts} fetchDataFunc={getBlogs} additionalParam={{draft:true , deletedDocCount:drafts.deletedDocCount}} />
            
            </>
        
            :<NoDataMessage message="No draft blogs."/>
         }
    </InPageNavigation>
    </>
  )
}
