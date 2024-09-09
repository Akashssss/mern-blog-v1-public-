import React, { useContext, useEffect, useRef, useState } from 'react';
import { uploadImage } from '../utils/imageUploadUtils';
import lightLogo from '../imgs/logo-light.png';
import darkLogo from '../imgs/logo-dark.png';
import lightBanner from '../imgs/blog banner light.png';
import darkBanner from '../imgs/blog banner dark.png';
import AnimationWrapper from '../common/page-animation';
import { Link ,useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { EditorContext } from '../pages/editor.pages';
import EditorJS from '@editorjs/editorjs';
import { tools } from './tools.component';
import axios from 'axios' ;
import { ThemeContext, UserContext } from '../App';

export default function BlogEditor() {
    const { blog, blog: { title, banner ,content , tags , des  }, setBlog ,textEdito , setTextEdito ,setEditorState } = useContext(EditorContext);
    const isR = useRef(false) ;
    let {blog_id} = useParams() ;
    const [bannerImage, setBannerImage] = useState(banner);
    const [oldPublicId, setOldPublicId] = useState(null);
    let {userAuth: {access_token}}  = useContext(UserContext) ;
    const {theme} = useContext(ThemeContext) ;
    const [textEditor , setTextEditor]= useState({isReady:false}) ;
    const navigate = useNavigate() ;


// todo: need a refinement that banner is uploaded and when we go to the publish and revert back to editor page and change the banner then the publicId state is again null that cause the ubable to clean up as oldPublicId is null . That should be repaired as in future as either make in state available untill it published completely and only just showing the preview of it initally and when published it on cloudinary .and when user try to edit it using edit blog then initally using useEffect get the banner's old Public id and and store in the state to perform the cleanup in  a right way . 

// todo : same cleanup needed in the edit profile comp. because  profile image also upload in the cloudinary , by default it is as use the api for default image but on edit profile user upload the image and it stores in the cloudinary , 


// todo : there is also an issue that image uploaded and its url is obtained from the server and  stor in banner state of the blog state , if there is an failure happen while saving the blog and then blog image url remains in the cloudinary and unable to clean up ( memory leaks) [ no pipelines through the process that if some faiure then changes should be reverted .]   same proble in edit profile image in edit-profile comp .

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let loadingToast = toast.loading("Uploading...");
        try {
            const response = await uploadImage(file, oldPublicId);

            if (response.success) {
                setBannerImage(response.file.url);
                setBlog({ ...blog, banner: response.file.url });
                setOldPublicId(response.file.publicId);

                toast.dismiss(loadingToast);
                toast.success('Uploaded 👍');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Error uploading image');
            console.error('Error uploading image:', error);
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) e.preventDefault();
    }

    const handleTitleChange = (e) => {
        let input = e.target;
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
        setBlog({ ...blog, title: input.value });
    }

    const handleError = (e) => {
        e.target.src = theme=='light'?lightBanner:darkBanner;
    }
   

   const handlePublishEvent=async()=>{
      if(!banner.length) 
             return toast.error("upload a blog banner to publish it.") ; 
       if(!title.length)  
          return toast.error("Blog title is required to publish it.") ; 
      
     try {
        if(textEditor.isReady){
            const data  = await  textEditor.save() ; 
            console.log( "data" , data ,blog) ;
           if(data.blocks.length){
              setBlog({...blog , content : data }) 
            
              setEditorState("publish")
              console.log("from editor comp ", blog) ; 
            }
            else{
              return toast.error("Write something in your blog to publish it .") ; 
           }
       }  
        
     } catch (error) {
        toast.error("Internal server error to publish blog")
        console.log("Publish Error: " + error)
     }
   }


 
 // if(!textEditor.isReady)
        // { console.log("Inside the creat editor" ) ;
        //     setTextEditor ( new EditorJS({
        //         holder: 'textEditor',
        //         data: content,
        //         placeholder: "Let's write an awesome story...",
        //         tools: tools ,
               
        //     }));
        // }

        const createEditor =async ()=>{
           // await textEditor.isReady ; 
            
          //    if(!isr) 
          //       {
          //           setTextEditor ( new EditorJS({
          //               holder: 'textEditor',
          //               data: content,
          //               placeholder: "Let's write an awesome story...",
          //               tools: tools ,
                       
          //           }));
          //       }
               // else
                //{
            //     console.log(isr)
            //     console.log(content) ;
            //     if (!isR.current) {
            //       console.log("inside isR")
            //        setTextEditor ( new EditorJS({
            //         holder: 'textEditor',
            //         data: content,
            //         placeholder: "Let's write an awesome story...",
            //         tools: tools ,
                   
            //     }));
                
            //     isR.current = true;
            //     console.log("text editor" ,textEditor)
            //   }
               // }


               
            }

   let [isr , setIsr] = useState(false);
   
   

    useEffect(() => {
        console.log("here the content is :" , content) ;
        if(!textEditor.isReady){
            console.log("logging the text editor" , textEditor) ;
            const newEditor = new EditorJS({
                holder: 'textEditor',
                data: Array.isArray(content)?content[0]:content,
                placeholder: "Let's write an awesome story...",
                tools: tools ,
                onReady: () => {
                    console.log('Editor.js is ready to work!')  ;}
                    
            })
            console.log(newEditor)
            setTextEditor (newEditor );
            
        }
       
        //   createEditor() ; 
         

    }, []);
   
    const handleSaveDraft = async (e)=>{

        if (e.target.className.includes('disable')) {
            return;
          }
          if (!title || !title.trim().length)
            return toast.error('Write blog title before saving it as a draft.');
        
          let loadingToast = toast.loading("Saving draft...");
      
          e.target.classList.add('disable');
      
          if(textEditor.isReady){
            let content = await textEditor.save(); 

            let blogObj = {
                title,
                banner,
                des,
                content,
                tags,
                draft: true
              }

            try {
                let data = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObj ,id: blog_id},
                  {
                    headers: {
                      'Authorization': `Bearer ${access_token}`
                    }
                  })
                console.log(data);
                e.target.classList.remove('disbale');
                toast.dismiss(loadingToast);
                toast.success('saved 👍');
          
          
                setTimeout(() => {
                  navigate("/dashboard/blogs?tab=draft");
                }, 500)
              } catch (error) {
                toast.dismiss(loadingToast);
                if (error.response.data.error) {
                  toast.error(error.response.data.error);
                }
                else
                  toast.error('Internal server error to publish blog.');
          
                console.log('Error publishing blog:', error);
                e.target.classList.remove('disable');
              }
          
          }
        

    }
    return (
        <>
            <nav className='navbar'>
                <Link to='/' className='flex-none w-10'>
                    <img src={theme=='light'?darkLogo:lightLogo} alt="Logo" />
                </Link>
                <p className='max-md:hidden text-black line-clamp-1 w-full'>
                    {title.length ? title : "New blog"}
                </p>
                <div className='flex gap-4 ml-auto flex-shrink-0'>
                    <button className='btn-dark py-2'
                    onClick= {handlePublishEvent}>
                        Publish
                    </button>
                    <button 
                    onClick= {handleSaveDraft}
                    className='btn-light py-2'>
                        Save Draft
                    </button>
                </div>
            </nav>
            <Toaster />
            <AnimationWrapper>
                <section>
                    <div className='mx-auto max-w-[900px] w-full'>
                        <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
                            <label htmlFor='uploadBanner'>
                                <img
                                    src={bannerImage}
                                    alt="Blog Banner"
                                    className='z-20'
                                    onError={handleError}
                                />
                                <input
                                    id='uploadBanner'
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea
                        defaultValue={title}
                            placeholder='Blog Title'
                            className='bg-white text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
                            onChange={handleTitleChange}
                            onKeyDown={handleTitleKeyDown}
                        >
                        </textarea>

                        <hr className='w-full opacity-10 my-5' />
                        <div id='textEditor' className='font-gelasio'>
                        </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    );
}
