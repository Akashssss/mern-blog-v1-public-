import React, { useEffect, useRef, useState } from 'react'
 // Todo : essential component .  Mark for future study .

 //!need to fix a bug on resizing it hr line is shown on trending page while trending page nav is hidden on large screen but its bottom hr is shown ...
export let activeTabLineRef ;
export let activeTabRef ;

export default function InPageNavigation({ 
    routes ,
    defaultHidden=[] ,
    defaultActiveIndex=0,
    children }) {

    let [inPageNavIndex, setInpageNavIndex] = useState(defaultActiveIndex);
    activeTabLineRef = useRef();
    activeTabRef = useRef() ;
    let [width , setWidth] = useState(window.innerWidth) ;
    let [isResizeEventAdded , setResizeEventAdded] = useState(false) ;
    let changePageState = (btn, i) => {
          let {offsetWidth , offsetLeft } =btn ; 
          activeTabLineRef.current.style.width= offsetWidth+"px" ; 
          activeTabLineRef.current.style.left= offsetLeft+"px" ; 
         setInpageNavIndex(i );
    }
    // so for first time hr takes  width for home ie by default
    useEffect(()=>{
        if(width>766 && inPageNavIndex!=defaultActiveIndex){
            changePageState(activeTabRef.current , defaultActiveIndex) ;

        }
     if(!isResizeEventAdded){
        window.addEventListener('resize', () => {
           if(!isResizeEventAdded){
              setResizeEventAdded(true) ;
           }
           setWidth(window.innerWidth) ;
        })
       
     }

    } ,[width])
 console.log(width);
    return (
        <>
            <div className='relative mb-8 bg-white border-grey border-b flex flex-nowrap  overflow-x-auto'>
                  {
                    routes.map((route, i) => {
                        return (
                            <button
                            ref={i== defaultActiveIndex ?activeTabRef:null}
                                className={`p-4 px-5 capitalize   ${inPageNavIndex === i ? 'text-black' : 'text-dark-grey'}  
                                 ${defaultHidden.includes(route) ?"md:hidden" :""}`}
                                key={i}
                                onClick={(e) => { changePageState(e.target, i) }}>
                                {route}
                            </button>
                        )
                    })
                }
                <hr ref={activeTabLineRef} className='absolute bottom-0 duration-300 border-dark-grey' />
            </div>
            {Array.isArray(children)?
            children[inPageNavIndex]:
            children}
        </>
    )
}
