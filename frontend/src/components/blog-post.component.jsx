import React from 'react'
import { getDay } from './../common/date';
import {Link } from 'react-router-dom'
export default function BlogPostCard({ content, author }) {

    let { publishedAt, tags, title, des, banner, activity: { total_likes }, blog_id: id } = content;
    let { fullname, username, profile_img } = author;
    return (
        <Link to ={`/blog/${id}`} className='w-full  grid grid-cols-12 gap-8  items-center border-b border-grey pb-5 mb-4 p-2 sm:p-0'>
        <div className='col-span-9 '>
            <div className='flex gap-2 items-center mb-7'>
                <img className="w-6 h-6 rounded-full" src={profile_img} />
                <p className='line-clamp-1'>{fullname} @{username}</p>
                <p className='min-w-fit'>{getDay(publishedAt)}</p>
            </div>
            <h1 className='blog-title break-words'>{title.length>100?(title.substring(0,100)+ '…'):title }</h1>
            <p className='my-3 text-xl font-gelasio leading-7  max-sm:hidden md:max-[1100px]:hidden line-clamp-2'>{des}</p>
            <div className='flex gap-4 mt-5 '> 
                <span className='btn-light py-1 px-4 mb-2'>{tags[0]}
               </span>
               <span className='flex items-center gap-2 text-dark-grey'>
                <i className='fi fi-rr-heart text-xl'></i>
                {total_likes}
               </span>
            </div>
        </div>
        <div className='h-28 aspect-[9/12]   md:aspect-square bg-grey col-span-2'>
           <img className='w-full h-full rounded-sm  aspect-square object-cover' src={banner} alt="" />
        </div>
        </Link>
    )
}
