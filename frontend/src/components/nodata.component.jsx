import React from 'react'

export default function NoDataMessage({message}) {
  return (
    <div  className='text-center p-4 w-full rounded-full  bg-grey/50 mt-4'>
        <p>
            {message}
        </p>
    </div>
  )
}
