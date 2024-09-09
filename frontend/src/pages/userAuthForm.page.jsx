import React, { useContext, useRef } from 'react'
import google from '../imgs/google.png';
import InputBox from '../components/input.component'
import { Link, Navigate } from 'react-router-dom';
import {Toaster ,toast } from 'react-hot-toast' ;
import axios from 'axios' ;
import AnimationWrapper from '../common/page-animation';
import { storeInSession } from '../common/session';
import { UserContext } from '../App';
import { authWithGoogle } from '../common/firebase';
import { confirmPasswordReset } from 'firebase/auth';



let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password



export default function UserAuthForm({ type }) {


    const userAuthThroughServer= async (serverRoute, formData) =>{
                console.log("sdlfh")
        try {
           const {data} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN+serverRoute ,formData);
           console.log(data) ; 
           storeInSession("user" , JSON.stringify(data)) ;
           setUserAuth(data) ; 
           console.log(sessionStorage) ;
    
        } catch ({response}) {
           toast.error(response?.data?.error) ;
           console.log(response?.data?.error) ; 
        }
     
    }

    let {userAuth :{access_token} , setUserAuth}  =useContext(UserContext) ; 
    console.log(access_token) ;

   let serverRoute = type=="sign-in" ?"/signin":"/signup" ;
    const handleSubmit = (e) => {
        e.preventDefault(); //prevent to submit the form 

   
        //get form data
        const form = new FormData(regForm);
        const formData = Object.fromEntries(form);
        console.log(formData);

        const { fullname, email, password } = formData;

        //validation in frontend as well 

        if (type == "sign-up") {
            // validate fullname
            if (fullname.trim().length < 3) {
                return toast.error('Full name must be 3 letters long' )
            }
        }
        if (!email.trim().length)
            return toast.error('Email is required' )
        if (!emailRegex.test(email))
            return toast.error('Invalid email format' )

        if (!password.trim().length)
            return toast.error('Password is required' )
        if (!passwordRegex.test(password))
            return toast.error('Password must be 6 to 20 characters long, including at least 1 uppercase letter, 1 lowercase letter, and 1 number') 



        userAuthThroughServer(serverRoute ,formData) ;
    }

    const handleGoogleAuth =async (e)=>{
        

     try {
        
        e.preventDefault() ;
        const user  =  await authWithGoogle() ;
        console.log(user) ; 
        let serverRoute = "/google-auth" ; 
        let formData = {access_token : user.accessToken }
        userAuthThroughServer(serverRoute, formData) ;
        
     } catch (error) {
        toast.error("Trouble logging through Google.") ; 
        console.error(error) ;
     }
    }

    return (
        access_token ?
        <Navigate to='/' />
        :
        <AnimationWrapper keyValue={type}>
            <section className='h-cover flex justify-center items-center'>
               <Toaster/>
                <form id="regForm" className='w-[80%] max-w-[400px]'>
                    <h1 className='text-4xl font-gelasio capitalize text-center mb-24'>
                        {type == "sign-in" ? "Welcome back" : "Join us Today"}
                    </h1>

                    {
                        type == 'sign-up' &&


                        <InputBox
                            type="text"
                            name="fullname"
                            placeholder="Full name"
                            icon="user"
                        />
                    }
                    <InputBox
                        type="email"
                        name="email"
                        placeholder="Email"
                        icon="envelope" />

                    <InputBox
                        type="password"
                        name="password"
                        placeholder="Password"
                        icon="key" />



                    <button
                        className='btn-dark center mt-14'
                        type="submit"
                        onClick={handleSubmit}>
                        {type.replace('-', ' ')}
                    </button>

                    <div className='relative w-full flex items-center  gap-2  my-10 opacity-10 uppercase text-black font-bold '>
                        <hr className='w-1/2 ' />
                        <p>or</p>
                        <hr className='w-1/2 ' />
                    </div>

                    <button  onClick={handleGoogleAuth} className='  btn-dark flex items-center justify-center gap-4 w-[90%] center '>
                        <img src={google} alt="" className='w-5 h-5' />
                        Continue with google
                    </button>

                    {
                        type == 'sign-in' ?
                            <p className="mt-6 text-dark-grey text-xl text-center">
                                Don't have an account?
                                <Link to='/signup'
                                    className='underline text-black text-xl ml-1'>
                                    Join us today
                                </Link>
                            </p>

                            : <p className="mt-6 text-dark-grey text-xl text-center">
                                Already a member?
                                <Link to='/signin'
                                    className='underline text-black text-xl ml-1'>
                                    Sign in here
                                </Link>
                            </p>
                    }
                </form>
            </section>
        </AnimationWrapper>

    )
}
