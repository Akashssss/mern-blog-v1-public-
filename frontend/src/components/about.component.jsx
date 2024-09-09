import React from 'react'
import { Link } from 'react-router-dom';
import { getFullDay } from '../common/date';

export default function AboutUser({ bio, social_links, joinedAt, className }) {
    return (
        <div
            className={`md:w-[90%] md:mt-7 ${className}`}>
            <p>{bio.length ? bio : "Nothing to read here."}</p>
            <div className='flex gap-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey '>

                {
                    Object.keys(social_links).map((key) => {
                        let link = social_links[key];
                        return link ? <Link target='_blank' key={key} to={`/${link}`}>
                            <i className={`fi ${key !== "website" ? "fi-brands-" + key : "fi-rr-globe"}  text-2xl hover:text-black`}></i>
                        </Link> : ""
                    })
                }



            </div>
            <p className='text-xl leading-7 text-dark-grey'>
                Joined on {getFullDay(joinedAt)}
            </p>
        </div>
    )
}
