import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from './../App';
import axios from 'axios';
import { profileDataStructure } from './profile.page';
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import toast, { Toaster } from 'react-hot-toast';
import InputBox from '../components/input.component';
import { uploadImage } from '../utils/imageUploadUtils';
import { storeInSession } from '../common/session';

export default function EditProfile() {

    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    let profileImgEle = useRef() ; 
    let editProfileForm = useRef() ;
    const [updatedProfileImg, setUpdatedProfileImg] = useState(null) ; 
    const  bioLimit = 150 ; 
    const [charactersLeft , setCharactersLeft] = useState(bioLimit);
    let { personal_info: { fullname, username: profile_username, profile_img, email, bio }, social_links } = profile;
    const { userAuth, setUserAuth , userAuth: { access_token } } = useContext(UserContext);
    useEffect(() => {
        if (access_token) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-profile', { username: userAuth.username })
                .then((data) => {
                    console.log(data);
                    setProfile(data.data.user);
                    setLoading(false);
                }).catch((error) => {
                    console.log(error);
                    setLoading(false);
                })
        }

    }, [access_token]);

const handleImageUpload = async (e)=>{
  e.preventDefault() ; 
  try {
    if(updatedProfileImg){
        let loadingToast = toast.loading("Uploading...") ; 
        e.target.setAttribute("disabled" ,true) ; 
           if(updatedProfileImg){
              const response  =   await uploadImage(updatedProfileImg) ; 
              if(response.success){
                const {data} =  await axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/update-profile-image' ,{url : response.file.url},{
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                 })
                 console.log(data);
                 let newUserAuth = {
                    ...userAuth , profile_img:data.profile_img
                 } ; 
                 console.log(data.profile_img) ;
                 console.log(userAuth) ; 

                 storeInSession("user" , JSON.stringify(newUserAuth)) ;
                 setUserAuth(newUserAuth) ;
                 console.log("after updating : " , userAuth)
                 setUpdatedProfileImg(null) ;
                 toast.dismiss(loadingToast) ;
                 e.target.removeAttribute("disabled") ; 
                 toast.success("Profile Image updated successfully 👍") ;

              }
              else{
                throw new Error(response.error) ;
              }
               
           }
         
      }
    
  } catch (error) {
    toast.dismiss(loadingToast) ;
    e.target.removeAttribute("disabled" ) ;
    toast.error("Failed to upload profile image.") ;
    console.log(error) ;
  }
}



    const handleCharacterChange = (e) =>{
        setCharactersLeft(bioLimit- e.target.value.length);
    }
    const handleImagePreview = (e)=>{
        let img  = e.target.files[0]   ; 
        profileImgEle.current.src=  URL.createObjectURL(img);
        setUpdatedProfileImg(img) ; 

      

    }


    const handleSubmit =async (e) =>{
        e.preventDefault() ; 
        let form  =  new FormData(editProfileForm.current) ; 
        let formData = {} ; 
        for(let  [key, value] of form.entries())
            formData[key] = value ;
        let {username, bio , youtube, facebook , twitter, github, instagram , website } = formData ; 
        if(username.length<3 )
             return toast.error("Username should be at least 3 letters long.") 
        if(bio.length>bioLimit){
            return toast.error(`Bio should not be more than ${bioLimit} letters.`)
        } 
        let loadingToast = toast.loading("Updating...") ; 
        e.target.setAttribute("disabled" ,true) ;
        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", {username, bio , social_links:{youtube , facebook , twitter , github , instagram , website }}, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        }).then(({data})=>{
            console.log("data from server to frontend", data) ;
            if(userAuth.username!=data.username)
            {
                let newUserAuth = {
                   ...userAuth, username:data.username
                } ;
                console.log(newUserAuth) ;
                storeInSession("user" , JSON.stringify(newUserAuth)) ;
                setUserAuth(newUserAuth) ;
            }
            toast.dismiss(loadingToast) ;
            e.target.removeAttribute("disabled" ) ;
            toast.success("Profile updated successfully 👍.") ;
        }).catch(({response})=>{
            toast.dismiss(loadingToast) ;
            e.target.removeAttribute("disabled" ) ;
            toast.error(response.data.error) ;
            console.log(response.data.error) ;
        });


}


    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    <form ref={editProfileForm}>
                        <Toaster />
                        <h1 className='max-md:hidden'>Edit profile</h1>

                        <div className='flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10'>
                            <div className='max-lg:center mb-5 '>
                                <label htmlFor="uploadImg"
                                    className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden" id="profileImgLable" >
                                    <img ref={profileImgEle} src={profile_img} alt="" />

                                    <div className='w-full h-full absolute  top-0 left-0  flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer'>
                                        Upload Image
                                    </div>
                                </label>
                                <input 
                                 type='file' 
                                 id='uploadImg' 
                                 accept="image/png, image/jpeg, image/jpg" 
                                 hidden
                                 onChange={handleImagePreview}>

                                </input>
                                <button 
                                onClick={handleImageUpload}
                                className='btn-light mt-5 max-lg:center  lg:w-full px-10 '>Upload</button>
                            </div>
                            <div className='w-full'>
                                <div className='grid grid-cols-1 md:grid-cols-2 md:gap-5'>
                                    <div>
                                        <InputBox name='fullname' type='text' value={fullname} placeholder="Full name" disable={true} icon="user" />
                                    </div>
                                    <div>
                                        <InputBox name='email' type='email' value={email} placeholder="Email" disable={true} icon="envelope" />
                                    </div>
                                </div>
                                <InputBox  type='text' name='username' placeholder="Username" value={profile_username} icon="at"  />

                                <p className='text-dark-grey -mt-3'>Username will use to search user and will be visible to all users</p>
                                <textarea name='bio' maxLength={bioLimit} onChange={handleCharacterChange} defaultValue={bio} className='input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5 ' placeholder='Bio'></textarea>
                                <p className = "mt-1 text-dark-grey">{charactersLeft} characters left</p>
                                <p className='my-6 text-dark-grey '>Add social handles below</p>
                                <div className='md:grid md:grid-cols-2 gap-x-6 '>
                                  {
                                    Object.keys(social_links).map((key, i)=>{
                                        let link = social_links[key] ; 
                                        <i className={`fi ${key !== "website" ? "fi-brands-" + key : "fi-rr-globe"}  text-2xl hover:text-black`}></i>
                                        return <InputBox key={i} name={key} type="text" vlaue={link} placeholder="https://" 
                                        icon={`fi ${key !== "website" ? "fi-brands-" + key : "fi-rr-globe"}`} /> 
                                    })
                                  }
                                </div>
                                <button
                                type='submit'
                                onClick={handleSubmit}
                                className='btn-dark w-auto px-10 '>Update</button>
                            </div>
                        </div>
                    </form>
            }
        </AnimationWrapper>
    )
}
