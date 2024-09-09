import { useContext, useState, useRef, useEffect } from 'react';
import darkLogo from '../imgs/logo-dark.png' ; 
import lightLogo from '../imgs/logo-light.png' ;
import { Link,  Outlet, useNavigate } from 'react-router-dom';
import { ThemeContext, UserContext } from '../App';
import UserNavigationPanel from './user-navigation.component';
import useOnClickOutside from '../utils/hooks/useClickOutside.js'; // Import the custom hook
import axios from 'axios';
import { storeInSession } from '../common/session.jsx';

export default function Navbar() {
    const navigate = useNavigate() ; 
    const [userNavPanel, setUserNavPanel] = useState(false);
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const { userAuth,setUserAuth, userAuth: { access_token, profile_img ,new_notification_available } } = useContext(UserContext);
    const navPanelRef = useRef(null);
    let {theme, setTheme} = useContext(ThemeContext);
    // Use the custom hook to handle clicks outside the nav panel
    useOnClickOutside(navPanelRef, () => setUserNavPanel(false));
  
    const handleSearch = (e) => {
        let query = e.target.value  ; 
        if(e.keyCode === 13 && query.length)
        {
               navigate(`/search/${query}`);
        }
    }


    const changeTheme=()=>{
        let newTheme = theme ==='light'?'dark':'light';
        setTheme(newTheme);
        document.body.setAttribute('data-theme', newTheme);
        storeInSession("theme" ,newTheme);
    }
    useEffect(()=>{
        if(access_token){
            axios.get(import.meta.env.VITE_SERVER_DOMAIN+'/new-notiification' ,{
                headers:{
                    'Authorization': `Bearer ${access_token}`
                }
            }).then(({data})=>{
                console.log(data) ;  // Update the user's notification status in the UserContext state
                setUserAuth({...userAuth,...data})
            }).catch(error=>{
                console.log(error) ; 
            })
        }
        

    },[access_token]) ; 

    console.log(new_notification_available) ;
    return (
        <>
            <nav className='navbar z-50'>
                <Link to='/' className='flex-none w-10'>
                    <img src={theme=='light'?darkLogo:lightLogo} alt='logo' className='w-full' />
                </Link>
                <div
                    className={`py-4 px-[5vw] absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey
                                md:border-0 md:p-0 md:block md:show md:relative md:inset-0 md:w-auto ${searchBoxVisibility ? "show" : "hide"}`}>
                    <input
                        type="text"
                        onKeyDown={handleSearch}
                        placeholder='Search'
                        className='w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12'
                    />
                    <i className="text-xl text-dark-grey fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 "></i>
                </div>

                <div className='flex items-center gap-3 md:gap-6 ml-auto'>
                    <button
                        onClick={() => setSearchBoxVisibility(prev => !prev)}
                        className='md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center'>
                        <i className='fi fi-rr-search text-xl'></i>
                    </button>

                    <Link to='/editor' className='hidden md:flex gap-2 link'>
                        <i className='fi fi-rr-file-edit'></i>
                        <p>Write</p>
                    </Link>
                    <button onClick={changeTheme} className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10'>
                         <i className={`fi fi-rr-${theme=='light'?"moon-stars ":"sun "} text-2xl block mt-1`}></i>
                
                                </button>

                    {access_token ? (
                        <>
                            <Link to='/dashboard/notifications'>
                                <button className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10'>
                                    <i className='fi fi-rr-bell text-2xl block mt-1'></i>
                                    {new_notification_available && 
                                    <span className='bg-red/90 w-3 h-3 rounded-full absolute z-10 top-2 right-2'></span>}
                                    
                                </button>
                            </Link>

                            <div
                                ref={navPanelRef}
                                className='relative'
                                onClick={() => setUserNavPanel(prev => !prev)}
                            >
                                <button className='w-12 h-12 mt-1'>
                                    <img src={profile_img} alt="" className='w-full h-full object-cover rounded-full ' />
                                </button>
                                {userNavPanel && <UserNavigationPanel />}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to='/signin' className='btn-dark py-2'>
                                Sign in
                            </Link>

                            <Link to='/signup' className='btn-light py-2 hidden md:block'>
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
            <Outlet />
        </>
    );
}
