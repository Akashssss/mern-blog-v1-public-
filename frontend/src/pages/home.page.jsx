import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation from './../components/inpage-navigation.component';
import axios from 'axios';
import Loader from './../components/loader.component'
import BlogPostCard from '../components/blog-post.component';
import MinimalBlogPost from '../components/nobanner-blog-post.component';
import { activeTabRef } from './../components/inpage-navigation.component';
import NoDataMessage from '../components/nodata.component';
import filterPaginationData from '../common/filter-pagination-data';
import LoadMoreDataBtn from '../components/load-more.component';
export default function HomePage() {

  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let categories = ["programming", "cinema", "food", "finance", "tech", "fitness", "travel", "space"];
  let [pagestate, setPageState] = useState("home");


  const fetchLatestBlogs = async ({page=1}) => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs" , {page});
       
      
      let formatedData = await filterPaginationData({
        state:blogs , 
        data: data.blogs , 
        page ,
        countRoute: "/all-latest-blogs-count" ,

      })
      console.log(formatedData) ;
      setBlogs(formatedData) ;

    } catch (error) {
      console.log(error);
    }
  }

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs");
      setTrendingBlogs(data.blogs)

    } catch (error) {
      console.log(error);
    }
  }
  const fetchBlogsByCategory = async ({page=1}) => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pagestate ,page });
      let formatedData = await filterPaginationData({
        state:blogs , 
        data: data.blogs , 
        page ,
        countRoute: "/search-blogs-count" ,
        data_to_send: {tag:pagestate}

      })
      console.log(formatedData) ;
      setBlogs(formatedData) ;
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    activeTabRef.current.click();
    if (pagestate === "home") {
      fetchLatestBlogs({page:1});
    }
    else {
      fetchBlogsByCategory({page:1});
    }
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
    console.log(blogs);
    console.log(trendingBlogs)
  }, [pagestate]);

  const loadByCategory = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlogs(null)
    if (pagestate === category) {
      setPageState("home");
      return;
    }
    setPageState(category);


  }

  return (
    <AnimationWrapper >
      <section className='h-cover flex justify-center gap-10  top-0'>

        {/*latest blogs */}
        <div className='w-full  '>
          <InPageNavigation routes={[pagestate, "trending blogs"]} defaultHidden={["trending blogs"]}>






            <>
              {
                blogs == null ?
                  <Loader />
                  :
                  (blogs.results.length
                    ? (
                      blogs.results.map((blog, i) => {
                        return <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                          <BlogPostCard content={blog} author={blog.author.personal_info} />
                        </AnimationWrapper>
                      }))
                    : (<NoDataMessage message="No blogs published" />)
                  )
              }
                  <LoadMoreDataBtn  state={blogs} fetchDataFunc={(pagestate==="home" ?fetchLatestBlogs : fetchBlogsByCategory)}/>
            </>
            {
              trendingBlogs == null ?
                <Loader />
                :
                (trendingBlogs.length) ?
                  (trendingBlogs.map((blog, i) => {
                    return <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  })) :
                  (<NoDataMessage message="No trending blogs" />)
            }

          </InPageNavigation>
        </div>

        {/* filters and trending blogs*/}

        <div className='min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden '>
          <div className='flex flex-col gap-10 '>
            <div>
              <h1 className='font-medium text-xl mb-8'>Stories from all interests</h1>
              <div className='flex  flex-wrap gap-3'>
                {categories.map((category, i) => {
                  return <button
                    key={i}
                    className={`tag ${pagestate === category ?
                      "bg-black text-white" : ""
                      }`}
                    onClick={loadByCategory}>
                    {category}
                  </button>
                })}
              </div>
            </div>

            <div>
              <h1 className='font-medium text-xl mb-8 '>Trending
                <i className='ml-1 fi fi-rr-arrow-trend-up'></i></h1>
              {
                trendingBlogs == null ?
                  <Loader />
                  :
                  (trendingBlogs.length) ?
                    (
                      trendingBlogs.map((blog, i) => {
                        return <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} key={i}>
                          <MinimalBlogPost blog={blog} index={i} />
                        </AnimationWrapper>
                      })
                    )
                    :
                    (
                      <NoDataMessage message="No trending blogs" />
                    )

              }

            </div>
          </div>
          <div>
          </div>
        </div>

      </section>
    </AnimationWrapper>
  )
}
