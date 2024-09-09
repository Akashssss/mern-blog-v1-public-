import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserContext } from '../App'
import { Navigate, useParams } from 'react-router-dom';
import BlogEditor from '../components/blog-editor.component';
import PublishForm from '../components/publish-form.component';
import Loader from '../components/loader.component';
import axios from 'axios' ; 

const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des:'',
    author: {personal_info:{}},
 };

export const EditorContext = createContext({}) ;



export default function Editor() {
    let {blog_id} = useParams() ; 
   const [blog ,  setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState("editor")
    const  [textEditor , setTextEditor] = useState({isReady:false})
    let { userAuth: { access_token }, setUserAuth } = useContext(UserContext);
    const [loading , setLoading] = useState(true) ; 

const getBlog = async ()=>{
    console.log("inside the getBlog")
   try {
    console.log(blog_id) ;
    const {data:{blog}} = await axios.post(import.meta.env.VITE_SERVER_DOMAIN +'/get-blog',{
        blog_id , draft :true , mode:'edit'
    })
    console.log(data.blog) ;
    setBlog(blog) ;
    setLoading(false) ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set
    
   } catch (error) {
     setBlog(null) ;
     setLoading(false) ;
   }
}
    useEffect(()=>{
        if(!blog_id){
            console.log("inside  the useEffect ")
            return setLoading(false) ; 
        }
        // console.log(blog_id)
        //getBlog() ; 
        axios.post(import.meta.env.VITE_SERVER_DOMAIN +'/get-blog',{
            blog_id , draft :true , mode:'edit'
        }).then(({data:{blog}})=>{
            console.log(blog)
            setBlog(blog) ;
            setLoading(false) ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to
        }).catch(err=>
        {   console.log(err); 
            setBlog(NULL ) ; 
            setLoading(false) ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set loading to false after getting the blog data  ;  // set
        }
        )
         
    },[])
     
    return (
      <EditorContext.Provider value = {{blog , setBlog ,editorState ,setEditorState ,textEditor , setTextEditor}}>
       { access_token === null
            ?
            <Navigate to='/signin' />
            :loading?<Loader/>:
            editorState == "editor"
                ?
                <BlogEditor/>
                :
                <PublishForm/>
       }
       </EditorContext.Provider>
    )
}
