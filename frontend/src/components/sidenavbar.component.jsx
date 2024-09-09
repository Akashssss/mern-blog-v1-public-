import React, { useContext, useEffect, useRef, useState } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { UserContext } from '../App'

export default function SideNav() {
   let page = location.pathname.split('/')[2];
   let [pageState, setPageState] = useState(page);

   let activeTabLine = useRef();
   let sideBarIconTab = useRef();
   let pageStateTab = useRef();
   let [showSideNav, setShowSideNav] = useState(false);
   const changePageState = (e) => {
      console.log("inside the page state") ;
      let { offsetWidth, offsetLeft } = e.target;
      activeTabLine.current.style.width = offsetWidth + 'px';
      activeTabLine.current.style.left = offsetLeft + 'px';
      if (e.target == sideBarIconTab.current) {
         setShowSideNav(true);
      }
      else
         setShowSideNav(false);
   }

   const { userAuth: { access_token ,new_notification_available } } = useContext(UserContext);


   useEffect(()=>{
      setShowSideNav(false) ; 
      console.log(pageState)
         pageStateTab.current?.click() ;

     
    },[pageState]) ;





   return (
      access_token == null ? <Navigate to='/signin' /> :
         <>
            <section className='relative flex gap-10 py-0 m-0 max-md:flex-col '>
               <div className='sticky top-[80px] z-30'>

                  <div className='md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto '>
                     <button onClick={changePageState} ref={sideBarIconTab} className='p-5 capitalize '>
                        <i className='fi fi-rr-bars-staggered pointer-events-none'></i>
                     </button>
                     <button onClick={changePageState} ref={pageStateTab} className='p-5 capitalize '>
                        {pageState}
                     </button>
                     <hr ref={activeTabLine} className='absolute bottom-0 duration-500 ' />
                  </div>
                  <div className={`min-w-[200px] md:h-cover h-[calc(100vh-80px-60px)] md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white  max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 ${!showSideNav? "max-md:opacity-0 max-md:pointer-events-none ": "opacity-100  pointer-events-auto"} `}>
                     <h1 className='text-xl  text-dark-grey mb-2'>
                        Dashboard
                     </h1>
                     <hr className='border-grey -ml-6 mb-8 mr-6' />
                     <NavLink to='/dashboard/blogs' className='sidebar-link' onClick={(e) => { setPageState(e.target.innerText) }}>
                        <i className='fi fi-rr-document'></i>
                        Blogs
                     </NavLink>
                     <NavLink to='/dashboard/notifications' className='sidebar-link' onClick={(e) => { setPageState(e.target.innerText) }}>
                        <div className='relative'>
                        <i className='fi fi-rr-bell'></i>
                        {
                           new_notification_available && 
                           <span className='bg-red w-2 h-2 rounded-full absolute z-10 top-0 right-0'></span>
                        }
                        </div>
                        Notification
                     </NavLink>
                     <NavLink to='/editor' className='sidebar-link' onClick={(e) => { setPageState(e.target.innerText) }}>
                        <i className='fi fi-rr-file-edit'></i>
                        Write
                     </NavLink>

                     <h1 className='text-xl  text-dark-grey mb-2 mt-20'>
                        Settings
                     </h1>
                     <hr className='border-grey -ml-6 mb-8 mr-6' />

                     <NavLink to='/settings/edit-profile' className='sidebar-link' onClick={(e) => { setPageState(e.target.innerText) }}>
                        <i className='fi fi-rr-user'></i>
                        Edit profile
                     </NavLink>
                     <NavLink to='/settings/change-password' className='sidebar-link' onClick={(e) => { setPageState(e.target.innerText) }}>
                        <i className='fi fi-rr-lock'></i>
                        Change password
                     </NavLink>

                  </div>
               </div>

               <div className='max-md:-mt-8 mt-5 w-full '>
                  <Outlet />
               </div>
            </section>




         </>

   )
}
