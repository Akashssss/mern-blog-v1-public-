import express, { request } from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import dbConnect from './Db.js';
import User from './Schema/User.js'
import { validateFullName, validateEmail, validatePassword } from './utils/validations/formValidaitons.js';
import generateUsername from './utils/GenerateUsername.js';
import formatDataToSend from './utils/formatDataToSend.js';
import admin from 'firebase-admin'; // for serverside to use firebase
import serviceAccountKey from './react-blog.json' assert   {type: "json"};
import { getAuth } from 'firebase-admin/auth';
import upload from './config/uploadConfig.js';
import cloudinary from './config/cloudinaryConfig.js'; // Ensure the path is correct
import { deleteImageFromCloudinary } from './config/deleteImageUtils.js';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import Blog from './Schema/Blog.js'
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js';
const server = express();
server.use(cors());
server.use(express.json());
dbConnect();





admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})


server.post('/signup', async (req, res) => {
    const { fullname, email, password } = req.body;
    const fullnameError = validateFullName(fullname);
    if (fullnameError)
        return res.status(403).json({ "error": fullnameError });
    const emailError = validateEmail(email);
    if (emailError)
        return res.status(400).json({ error: emailError });
    const passwordError = validatePassword(password);
    if (passwordError)
        return res.status(400).json({ error: passwordError });


    bcrypt.hash(password, 10, async (err, hashed_password) => {
        try {

            let username = await generateUsername(email);
            let user = new User({
                personal_info: {
                    fullname,
                    email,
                    password: hashed_password,
                    username
                }
            });
            const savedUser = await user.save();
            return res.status(200).json(formatDataToSend(user))

        } catch (error) {
            if (error.code = 11000)
                return res.status(500).json({ error: "Email already exists" })
            console.log(error);
            return res.status(500).json({ error: 'Server Error' + error.message });
        }
    })
})


server.post('/signin', async (req, res) => {

    const { email, password } = req.body;
    console.log(email, password);
    try {

        const user = await User.findOne({ "personal_info.email": email });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        console.log(user);
        if (user?.google_auth)
            return res.status(403).json({ error: 'This email was signed up without google. Please log in with Password to access the account.' });

        const match = await bcrypt.compare(password, user.personal_info.password);
        if (!match)
            return res.status(403).json({ error: 'Invalid credentials' });

        return res.status(200).json(formatDataToSend(user));

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server Error' + error.message });
    }

})

server.post('/google-auth', async (req, res) => {
    try {

        let { access_token } = req.body;
        console.log(access_token)
        const decodedUser = await getAuth().verifyIdToken(access_token);
        console.log(decodedUser);
        let { email, name, picture } = decodedUser;
        // picture = picture.replace("s96-c" ,"s384-c") ; 
        let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth");
        console.log("find user : ", user);
        if (user) {
            if (!user.google_auth) {
                console.log("user.google_auth");
                return res.status(403).json({ "error": "This email was signed up without google. Please log in with Paasword to access the account." })
            }

        }
        else {
            let username = await generateUsername(email);
            console.log("generate username : ", username);
            user = new User({
                personal_info: {
                    fullname: name,
                    email,
                    profile_img: picture,
                    username,
                },
                google_auth: true
            })
            console.log("user is ", user)

            const newuser = await user.save();
            console.log("newuser ", newuser);
        }

        return res.status(200).json(formatDataToSend(user))



    } catch (error) {
        return res.status(500).json({ "error": error.message });
    }

})
const verifyJWT = async (req, res, next) => {
    //access token send in a header 
    // authorization : Bearer <access_token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: 'No access token.' });
    try {
        const decoded = await jwt.verify(token, process.env.SECRET_ACCESS_KEY);
        req.user = decoded.id;
        next();
    } catch (error) {
        console.error('Invalid token:', error);
        return res.status(401).json({ error: `Access token is invalid.${authHeader}` });
    }
    try {


    } catch (error) {

    }
}


server.post('/update-profile-image' , verifyJWT , (req, res)=>{
    let {url}=  req.body ; 
    User.findOneAndUpdate({_id:req.user} ,{
        "personal_info.profile_img":url
    }).then(()=>
    res.status(200).json({"profile_img" :url}      
    )).catch((err)=>{
        res.status(500).json({error:err.message})
    })
})
server.post('/Change-password',verifyJWT,(req, res)=>{
    let {currentPassword ,newPassword} = req.body ; 
   
    if(validatePassword(currentPassword) || validatePassword(newPassword) ){
        return res.status(403).json({error: "Password should be 6 to 20 characters long with a numeric ,one lowecase and one uppercase character."}) }
    User.findOne({_id:req.user}).then(
        (user)=>{
            if(user.google_auth)
              return res.status(403).json({error: "You can't change account'spassword because you logged in through Google."})
             bcrypt.compare(currentPassword,user.personal_info.password, (err, result)=>{
                if(err){
                    return res.status(500).json({error: "Some error occured while changing password.Please try again later."})
                }
                if(!result)
                     return res.status(403).json({error: "Incorrect current password."})

                bcrypt.hash(newPassword , 10 , (err, hashed_passsword)=>{
                    User.findOneAndUpdate({_id: req.user} ,{ "personal_info.password":hashed_passsword }).then(
                        (u)=>{
                            return res.status(200).json({status: "Password changed successfully."})
                        }
                    ).catch(err=>{
                        return res.status(500).json({
                            error: "Some error occured while changing password. Please try again later."
                        })
                    })
                })
             })
               

            
        }
    ).catch(error=>{
        console.log(error) ; 
        return res.status(500).json({error: "User not found."})
    })

})


// server/routes/upload.js

server.post("/update-profile", verifyJWT, (req,res)=>{
    let {username , bio , social_links} =  req.body ; 
    console.log(req.body) ; 

    let bioLimit =  150 ; 
    if(username.length<3)
         return res.status(403).json({error: "Username should be at least 3 letters long."}) ; 
    if(bio.length>bioLimit)
         return res.status(403).json({error: `Bio should not exceed ${bioLimit} characters.`}) ; 
    let socialLinksArr = Object.keys(social_links);
    console.log(socialLinksArr) ;
    try {
          for(let i = 0 ; i< socialLinksArr.length ; i++ ) 
             {
                if(social_links[socialLinksArr[i]].length){
                    let hostname =  new URL(social_links[socialLinksArr[i]]).hostname ; 
                    if(!hostname.includes(`${socialLinksArr[i]}.com`) &&  socialLinksArr[i]!= 'website')
                         return res.status(403).json({error: `${socialLinksArr[i]} link is invalid. You must enter a full link.`}) ; 
 
                }
             }
        
    } catch (error) {
        console.log(error) ;  // Handle errors here
        return res.status(500).json({error: "You must provide full social links with http(s) included."})
    }


    let updateObj = {
        "personal_info.username":username,
        "personal_info.bio":bio,
        "social_links":social_links
    }

    User.findOneAndUpdate({_id: req.user},updateObj,{
        runValidators:true 
    }).then((u)=>{
        console.log("updated user" ,u );
        return res.status(200).json({username}) ; 
        
    }).catch(err=>{
        if(err.code ==11000)
        {
            return res.status(403).json({error: "Username already exists."})
        }
        return res.status(500).json({error:err.message}) ;
    })
})



server.post('/uploadProfileImage' , upload.single('profile'), async (req, res)=>{
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const imageUrl = req.file.path; // Cloudinary URL from `CloudinaryStorage`
        const publicId = req.file.filename; // Filename used as public ID

        // Delete the old image if it exists
        if (req.body.oldPublicId) {
            await deleteImageFromCloudinary(req.body.oldPublicId);
        }

        res.json({
            imageUrl: imageUrl,
            publicId: publicId
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Server error' });
    }

})
 // todo:  voilation of the DRY principle as both up and down functions both have the same code except upload.single() argument 
server.post('/upload', upload.single('banner'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const imageUrl = req.file.path; // Cloudinary URL from `CloudinaryStorage`
        const publicId = req.file.filename; // Filename used as public ID

        // Delete the old image if it exists
        if (req.body.oldPublicId) {
            await deleteImageFromCloudinary(req.body.oldPublicId);
        }

        res.json({
            imageUrl: imageUrl,
            publicId: publicId
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


server.delete('/delete', async (req, res) => {
    const { publicId } = req.body;
    console.log(req);
    if (!publicId)
        return res.status(400).json({ error: 'Public ID is required' });
    try {
        await deleteImageFromCloudinary(publicId);
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});










//blog routes 

server.post('/create-blog', verifyJWT, async (req, res) => {
    try {



        let authorId = req.user;
        let { title, des, banner, tags, content, draft, id } = req.body;

        if (!title || !title.trim().length)
            return res.status(403).json({ error: "You must provide a title." });
        if (!draft) {
            if (!des || !des.trim().length || des.trim().length > 200)
                return res.status(403).json({ error: "You must provide a description under 200 characters to publish it." });
            if (!banner.trim().length)
                return res.status(403).json({ error: "You must provide blog banner to publish it." });
            if (!content.blocks.length)
                return res.status(403).json({ error: "There must be some blog content to publish it." });
            if (!tags.length || tags.length > 10)
                return res.status(403).json({ error: "You must provide at least 1 and at most 10 tags to publish it." });
        }
        tags = tags.map(tag => tag.toLowerCase());

        // todo : future improvements : check the blogId is uniquely generated or not ( trust issue with nanoid)
        let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid();
        console.log(blog_id);

        if (id) {

            try {
                const blog = await Blog.findOneAndUpdate({ blog_id }, {
                    title,
                    des,
                    banner,
                    tags,
                    content,
                    draft: Boolean(draft)
                });
                return res.status(200).json({ id: blog_id });
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }


        } else {
            let blog = new Blog({

                title,
                des,
                banner,
                tags,
                content,
                author: authorId,
                blog_id,
                draft: Boolean(draft)
            })

            const blogData = await blog.save();

            let incrementVal = draft ? 0 : 1;
            try {
                const userData = await User.findOneAndUpdate({ _id: authorId }, { $inc: { 'account_info.total_posts': incrementVal }, $push: { "blogs": blogData._id } },);

            } catch (error) {
                return res.status(500).json({ error: "failed to update total posts number." })
            }

            return res.status(200).json({ id: blogData.blog_id });
        }




    } catch (error) {

        return res.status(500).json({ error: error.message });
    }

})


server.post('/latest-blogs', async (req, res) => {
    let { page } = req.body;
    let maxLimit = 5;
    try {

        const blogs = await Blog
            .find({ draft: false })
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({ "publishedAt": -1 })
            .select("blog_id title des banner activity tags publishedAt -_id")
            .skip((page - 1) * maxLimit)
            .limit(maxLimit);
        return res.status(200).json({ blogs });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

})


server.get("/trending-blogs", async (req, res) => {
    try {
        const trendingBlogs = await
            Blog
                .find({ draft: false })
                .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
                .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
                .select("blog_id title publishedAt -_id")
                .limit(5)
        return res.status(200).json({ blogs: trendingBlogs });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})


server.post("/search-blogs", async (req, res) => {
    //console.log(req.body)
    let { tag, query, page, author, limit, eliminateBlog } = req.body;
    let findQuery;
    if (tag)
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminateBlog } };
    else if (query)
        findQuery = { draft: false, title: new RegExp(query, 'i') };
    else if (author)
        findQuery = { draft: false, author };
    //console.log(findQuery);

    let maxLimit = limit ? limit : 2;
    try {
        let blogs = await Blog
            .find(findQuery)
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({ "publishedAt": -1 })
            .select("blog_id title des banner activity tags publishedAt -_id")
            .skip((page - 1) * maxLimit)
            .limit(maxLimit);
        return res.status(200).json({ blogs });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

})


server.post("/all-latest-blogs-count", async (req, res) => {
    try {
        let count = await Blog.countDocuments({ draft: false });
        return res.status(200).json({ totalDocs: count });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

server.post('/search-blogs-count', async (req, res) => {
    let { tag, query, author } = req.body;
    let findQuery;
    try {
        if (tag)
            findQuery = { tags: tag, draft: false };
        else if (query)  // search by title or description  only  if no tag provided  in request body
            findQuery = { draft: false, title: new RegExp(query, 'i') };
        else if (author)
            findQuery = { draft: false, author };
        let count = await Blog.countDocuments(findQuery);
        return res.status(200).json({ totalDocs: count });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

})

server.post("/search-users", async (req, res) => {


    try {
        let { query } = req.body;
        let users = await User
            .find({ "personal_info.username": new RegExp(query, 'i') })
            .limit(50)
            .select('personal_info.fullname personal_info.username personal_info.profile_img -_id');
        return res.status(200).json({ users });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})



server.post("/get-profile", async (req, res) => {
    try {
        let { username } = req.body;
        let user = await User.findOne({ "personal_info.username": username })
            .select("-personal_info.password -google_auth -updatedAt -blogs");
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})



server.post("/get-blog", async (req, res) => {

    let { blog_id, draft, mode } = req.body;
    const incrementVal = mode != 'edit' ? 1 : 0;
    try {
        const blog =
            await Blog
                .findOneAndUpdate({ blog_id }, { $inc: { "activity.total_reads": incrementVal } })
                .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img ")
                .select("title des content banner activity publishedAt blog_id tags");
        let user;
        if (blog) {

            user = await User
                .findOneAndUpdate(
                    { "personal_info.username": blog.author.personal_info.username },
                    { $inc: { "account_info.total_reads": incrementVal } }
                )
        }
        if (blog.draft && !draft)
            return res.status(500).json({ error: "You can not access draft blogs." })



        return res.status(200).json({ blog });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }

});




server.post('/like_blog', verifyJWT, async (req, res) => {
    let user_id = req.user;
    let { _id, isLikedByUser } = req.body;
    let incrementVal = !isLikedByUser ? 1 : -1;

    try {
        const blog = await Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal } });
        console.log("is liked by user  :  ", isLikedByUser);
        if (!isLikedByUser) {
            console.log("inside the islikedby user ")
            let like = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id,
            });
            let notification = await like.save();
            console.log("\n\n\n this is notification : ", like, notification);
            return res.status(200).json({ liked_by_user: true })
        }

        else {
            const data = await Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" });
            console.log("\n\n\n this is data : ", data);
            return res.status(200).json({ liked_by_user: false })
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
})


server.post('/isLiked-by-user', verifyJWT, async (req, res) => {

    try {
        let user_id = req.user;
        let { _id } = req.body;
        //console.log(_id, user_id);
        const result = await Notification.exists({
            user: user_id, type: "like", blog: _id
        });
        //console.log("result is : ", (result));
        return res.status(200).json({ result });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
})









server.post('/add-comment', verifyJWT, async (req, res) => {
    let user_id = req.user;
    let { _id, comment, replying_to, blog_author,notification_id } = req.body;
    try {
        if (!comment || !comment.trim().length)
            return res.status(403).json({ error: "Write something to leave a comment." })

        // creating a comment doc  

        let commentObj = {
            blog_id: _id,
            blog_author,
            comment,
            commented_by: user_id,
         

        };
        if(replying_to){
            commentObj.parent = replying_to ; 
            commentObj.isReply=true ;
        }
        new Comment(commentObj)
            .save()
            .then(async commentFile => {
                let { comment, commentedAt, children } = commentFile;
                Blog.findOneAndUpdate({ _id },
                    {
                        $push: { "comments": commentFile._id },
                        $inc: {
                            "activity.total_comments": 1,
                            "activity.total_parent_comments":replying_to ?0: 1
                        }
                    })
                    .then(blog => { console.log("New comment added", blog); })
                    .catch(error => {
                        console.log(error.message);
                        return res.status(500).json({ error: error.message })
                    })
                let notificatonObj = new Notification({
                    type: replying_to ? "reply":"comment",
                    blog: _id,
                    notification_for: blog_author,
                    user: user_id,
                    comment: commentFile._id,
                    //replying_to,
                });
                if(replying_to){
                    notificatonObj.replied_on_comment= replying_to ; 
                    await Comment.findOneAndUpdate({_id:replying_to} ,{$push:{children:commentFile._id}})
                    .then(replyingToCommentDoc=>{
                        notificatonObj.notification_for=replyingToCommentDoc.commented_by
                    })
                    if(notification_id){
                        Notification
                        .findOneAndUpdate({_id:notification_id}, {reply:commentFile._id} )
                        .then(notification=>console.log("Notification updated")) ; 
                    }

                }
                notificatonObj
                    .save()
                    .then((notification) => { console.log("new notification created ", notification) })
                    .catch(error => {
                        console.log(error.message);
                        return res
                            .status(500)
                            .json({ error: error.message })
                    })

                return res.status(200).json({ comment, commentedAt, _id: commentFile._id, user_id, children });

            }).catch(error => {
                console.log(error.message);
                return res.status(500).json({ error: error.message })
            })





    } catch (error) {
        return res.status(500).json({ error: error.message })
    }

})




server.post('/get-blog-comments' ,(req, res)=>{
    let {blog_id , skip } =  req.body  ; 

    let maxLimit =  5  ; 
    console.log("comment blog id : " , blog_id) ;
    Comment
    .find({blog_id ,isReply :false  })
    .populate("commented_by" ,  "personal_info.username personal_info.profile_img  personal_info.fullname" )
    .skip( skip)
    .limit(maxLimit)
    .sort({
        'commentedAt':-1 
    }).then(comment =>{
        console.log('comment--> ',comment)
        return res.status(200).json(comment)
    }).catch(error=>{
        return res.status(500).json({error: error.message}) ; 
    })
})



server.post('/get-replies',async(req, res)=>{
    let {_id ,skip} = req.body ; 
    let maxLimit =  5  ; 
      Comment.findOne({_id})
      .populate({
        path:'children',
        options:{
            limit:maxLimit , 
            skip:skip ,
            sort:{'commentedAt':-1}

        },
        populate:{
           path: 'commented_by',
           select :"personal_info.profile_img personal_info.fullname  personal_info.username"
        },
        select:"-blog_id -updatedAt"
      })
      .select("children")
      .then(doc=>{
        console.log(doc) ; 
        return res.status(200).json({replies:doc.children}); 
      }).catch(error=>
       {
        return res.status(500).json({error:error.message}) ;
       }
      ) ;
})



const deleteComment= (_id)=>{
 
    Comment.findOneAndDelete({_id})
    .then((comment)=>{
        if(comment.parent){
            Comment.findOneAndUpdate({_id:comment.parent},{
                $pull:{children:_id}
            }).then(data=>console.log('comment delete from parent.'))
              .catch(error=>console.log(error.message))
        }

        Notification
        .findOneAndDelete({comment:_id})
        .then(notification=>{console.log('comment notification deleted')})
        Notification
        .findOneAndUpdate({reply:_id},{$unset:{reply:1}})
        .then(notification=>console.log('reply deleted'))

        Blog.findOneAndUpdate(
            {_id:comment.blog_id},
            {$pull:
                {comments:_id },
                $inc:{"activity.total_comments":-1, 
                    "activity.total_parent_comments":comment.parent?0:-1
                }

            },
           
        ).then(blog=>{
            if(comment.children.length)
            {
                comment.children.map(replies=>{
                    deleteComment(replies)
                })
            }
        })

    })
    .catch((error)=>{
        console.log(error.message);
    })
     



}
server.post('/delete-comment', verifyJWT,async(req, res)=>{

    let user_id = req.user;
    let { _id } = req.body;
    Comment.findOne({_id})
    .then((comment)=>{
        if(user_id==comment.commented_by || user_id== comment.blog_author)
        {
             
            deleteComment(_id) ; 
            return res.status(200).json({
                status:'done'
            })
        }
        else
        return res.status(403).json({
    error:"You can not delete this comment."})
    })
    
})


server.get('/new-notiification' ,verifyJWT , (req, res)=>{
    let user_id = req.user;
    Notification.exists({notification_for:user_id, seen:false ,user:{$ne:user_id}})
    .then(result=>{
        if(result)
            return res.status(200).json({new_notification_available:true})
        else
        return res.status(200).json({new_notification_available:false})
    }).catch(error=>{
        console.log(error) ; 
        return res.status(500).json({error:error.message})
    })
    
})

server.post("/notifications", verifyJWT ,(req, res)=>{
    let user_id = req.user ; 
    let {page ,filter , deletedDocCount} = req.body ;
    let maxLimit  = 10 ; // limit of results 
    let findQuery = {notification_for: user_id, user:{$ne:user_id}}
    let skipDocs = (page-1)*maxLimit ; 
    if(filter !='all'){
        findQuery.type = filter ; 
    } 
    if(deletedDocCount){
        skipDocs-=deletedDocCount ; 
    }

    Notification
    .find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate('blog','title blog_id')
    .populate('user', 'personal_info.fullname personal_info.username personal_info.profile_img')
    .populate('comment',"comment")
    .populate('replied_on_comment',"comment")
    .populate('reply' , 'comment') 
    .sort({createdAt:-1})
    .select("createdAt type seen reply")
    .then(notifications=>{
        Notification
        .updateMany(findQuery,{seen:true})
        .skip(skipDocs)
        .limit(maxLimit)
        .then(()=>console.log("Notifications seen"))
       return res.status(200).json({notifications})
    })
    .catch(error=>{
        console.log(error.message);
        return res.status(500).json({ error: error.message })
    })
})

server.post('/all-notifications-count', verifyJWT , (req, res)=>{
    let user_id = req.user ;
    let {filter} = req.body ; 
    let findQuery = {notification_for:user_id ,user:{$ne:user_id}} ; 
    if(filter!='all')
        findQuery.type=filter ; 
    
    Notification
    .countDocuments(findQuery)
    .then((count)=>{
        return res.status(200).json({totalDocs: count})
    })
    .catch(error=>{
        return res.status(500).json({error:error.message});
    })
})


server.post('/user-written-blogs' ,verifyJWT ,(req, res)=>{
    let user_id= req.user ; 
    let {page , draft , query, deletedDocCount} = req.body ; 
    console.log("req body : " ,req.body); 
    let maxLimit =5 ; 
    let skipDocs = (page-1)*maxLimit ; 


    if(deletedDocCount){
        skipDocs-=deletedDocCount ;
    }

    console.log(new RegExp(query,'i'))
    Blog.find({author:user_id,draft ,title: new RegExp(query, 'i') })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({publishedAt:-1})
    .select("title banner publishedAt blog_id activity des draft -_id")
    .then(blogs=>{
        console.log("data get \n",blogs) ;
        res.status(200).json({blogs})
    })
    .catch(err=>{
        return res.status(500).json({error:err.message});
    })

})

server.post('/user-written-blogs-count',verifyJWT , (req, res)=>{
    let user_id = req.user ; 
    let {draft ,query} = req.body ; 
  
    Blog.countDocuments({author:user_id, draft,title:new RegExp(query,'i')})
    .then(count=>
        {return res.status(200).json({totalDocs: count})}
    ).catch(err=>{
        console.log(err.message);
        return res.status(500).json({error:err.message});
    })
})

server.post('/delete-blog' , verifyJWT , (req, res)=>{
    let user_id = req.user ; 
    let { blog_id ,draft } = req.body ;
    Blog.findOneAndDelete({blog_id})
    .then(blog=>{
        Notification.deleteMany({blog:blog._id})
        .then(data=> 
        {console.log('all notification related  to blog is deleted');}) ;

        Comment.deleteMany({blog_id:blog._id})
        .then(data=>
        {console.log('all comment related  to blog is deleted');}) ;

        User.findOneAndUpdate({_id:user_id} ,
                  {$pull:{blog:blog._id} ,
                  $inc:{"account_info.total_posts":blog.draft?0:-1}})
        .then(user=>console.log('BLog deleted '))

        return res.status(200).json({status:'done'})
    })
    .catch(error=>{
        console.log(error.message);
        return res.status(500).json({error:error.message});
    })

})


const port = process.env.PORT;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
