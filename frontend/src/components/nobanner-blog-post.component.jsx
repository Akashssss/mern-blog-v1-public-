import React from 'react'
import { Link } from 'react-router-dom';
import { getDay } from '../common/date';

export default function MinimalBlogPost({ blog, index }) {
    let { title, blog_id: id, author: { personal_info: { fullname, username, profile_img } }, publishedAt } = blog;

    return (
        <Link to={`/blog/${id}`} className='w-full grid grid-cols-12 gap-5 mb-8 '>
            <h1 className='blog-index col-span-2'>{index < 10 ? "0" + (index + 1) : index + 1}</h1>
           <div className='flex-grow-0 col-span-10'>
           <div className='flex gap-2 items-center mb-7'>
                <img className="w-6 h-6 rounded-full" src={profile_img} />
                <p className='line-clamp-1'>{fullname} @{username}</p>
                <p className='min-w-fit'>{getDay(publishedAt)}</p>
            </div>
            <h1 className=' blog-title break-words'>{title}</h1>
           </div>
        </Link>
    )
}
