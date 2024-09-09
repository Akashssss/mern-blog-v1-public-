import React from 'react'

export default function LoadMoreDataBtn({state , fetchDataFunc,additionalParam}) {
  
  
  if(state!==null  && state.totalDocs > state.results.length)
    return (
    <button 
    onClick= {()=>{fetchDataFunc({...additionalParam,page:state.page+1})}}
    className='text-dark-grey py-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2 '>
        Load more
    </button>
  )
}
