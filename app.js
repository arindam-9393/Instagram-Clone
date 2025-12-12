// const express=require('express');
// const app=express();
// const bcrypt=require('bcrypt');
// const path =require('path');
// const cookieParser=require('cookie-parser');
// const userModel=require('./models/user');
// const post=require('./models/post');
// const jwt=require('jsonwebtoken');
// require('dotenv').config();

// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// app.use(cookieParser());

// app.set('view engine' , 'ejs');

// function isLoggedIn(req, res, next) {
//   try {
//     // 🧩 Step 1: get token from cookies
//     const token = req.cookies.token;

//     // 🧩 Step 2: if token not found, redirect to login
//     if (!token) {
//       return res.redirect("/login");
//     }

//     // 🧩 Step 3: verify token
//     const data = jwt.verify(token, process.env.JWT_KEY);

//     // 🧩 Step 4: store user info in request object
//     req.user = data; // now we can access user anywhere using req.user

//     // 🧩 Step 5: go to next route
//     next();
//   } catch (err) {
//     console.log("JWT verification failed:", err.message);
//     res.redirect("/login");
//   }
// }

// app.get('/' , (Req , res)=>{
//     res.render('hey');
// });

// app.get('/home' , isLoggedIn ,async (req ,res)=>{
//     let person=await userModel.findOne({email:req.user.email}).populate("posts");


//     res.render('home' , {person});
// });
// app.get('/like/:id', isLoggedIn, async (req, res) => {
//   try {
//     // ✅ Find the post by its ID
//     const foundPost = await post.findOne({ _id: req.params.id });

//     if (!foundPost) {
//       return res.status(404).send("Post not found");
//     }

//     // ✅ If user already liked, unlike it; else add like
//     const userId = req.user.id;
//     const likeIndex = foundPost.likes.indexOf(userId);

//     if (likeIndex === -1) {
//       foundPost.likes.push(userId); // like
//     } else {
//       foundPost.likes.splice(likeIndex, 1); // unlike
//     }

//     await foundPost.save();

//     // ✅ Redirect back to home page
//     res.redirect('/home');
//   } catch (err) {
//     console.error("Error liking post:", err);
//     res.status(500).send("Server error");
//   }
// });

// app.get('/create/post' , (req , res)=>{
//     res.render('createPost');
// });
// app.post('/createpost' ,isLoggedIn, async (req , res)=>{
//     let {content}=req.body;
//     let user=await userModel.findOne({email:req.user.email});
//     let posts = await post.create({
//         user:user._id,
//         content,

//     });
//     user.posts.push(posts._id);
//     await user.save();
//     res.redirect('/home');

// })
// app.post('/register' , (req , res)=>{
//     let {name , email , password}=req.body;
//     bcrypt.genSalt(10 , (err , salt)=>{
//         bcrypt.hash(password ,  salt , async (err , hash)=>{
//             await userModel.create({
//                 name,
//                 email,
//                 password:hash
//             })
//         })
//     })
    
//     res.redirect('/login')
// });
// app.get('/login' , (req , res)=>{
//     res.render('login');
// });

// app.post('/login' , async (req , res)=>{

//     try {
//     let {email , password}=req.body;
//     let person= await userModel.findOne({email});
//     if(!person){
//         res.send("Invalid Credentials");
//     }
//     bcrypt.compare(password , person.password  , (err , result)=>{
//         if(result){
//             const token=jwt.sign({email:person.email , id:person._id} ,process.env.JWT_KEY );
//             res.cookie('token', token);
//             res.redirect('/home');
//         }
//         else{
//             res.send('Invalid Credentials');
//         }
//     });
        
//     } catch (error) {
//         res.status(500).send('Server Error');
        
//     }

// });



// app.listen(3000 , function(){
//     console.log("Hey it is working perfectly");
// });

const cookieParser = require('cookie-parser');
const express=require('express');
const app=express();
const path=require('path');
const User=require('./models/user.js');
const bcrypt=require('bcrypt');
let jwt=require('jsonwebtoken');
const post=require('./models/post.js');

app.set('view engine' , 'ejs');


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())


function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies.token;

   
    if (!token) {
      return res.send(`
        <script>
          alert('I think you are not logged in. Click OK to login');
          window.location = '/login';
        </script>
      `);
    }

    
    const data = jwt.verify(token, "heyyy");
    req.user=data;

   
    next();
  } catch (err) {
    console.log("Something went wrong:", err);

    return res.send(`
      <script>
        alert('Session expired or invalid token. Please login again.');
        window.location = '/login';
      </script>
    `);
  }
};

app.get('/' , (req , res)=>{
  res.render('home')
});

app.get('/create' , (req , res)=>{
  res.render('hey');
});

app.post('/register' , async(req , res)=>{
  let{name  , password , email}=req.body;
  let humm= await User.findOne({email:email});
  if(humm){
    return res.send("<script>alert('You already have an account'); window.location='/login';</script>");
  }
  bcrypt.genSalt(10 , (err , salt)=>{
    bcrypt.hash(password, salt, async (err , hash)=>{
      let person=await User.create({
        name,
        email,
        password:hash
        
      });
    });
  });
  res.redirect('/login');
});

app.post('/login' , async (req , res)=>{
  let {name , email , password}=req.body;
  let person=await User.findOne({email});
  if(!person){
    res.send("<script> alert('Invalid Credentials');</script>")
  }
  bcrypt.compare(password , person.password , (err , result)=>{
    if(result){
     let token=jwt.sign({email:person.email , id:person.id} , "heyyy");
     res.cookie('token' , token);
     return res.redirect('/home');
    };
    res.send("<script> alert('Invalid Credentials');</script>");
    
  });
});

app.post('/like/:id' , isLoggedIn ,async(req , res)=>{
  let postwa=await post.findById(req.params.id);
  let person=await User.findOne({email:req.user.email});
  let likeindex= postwa.likes.indexOf(req.user.id);
  if(likeindex==-1){
    postwa.likes.push(req.user.id);
  }else{
    postwa.likes.splice(likeindex, 1);
  };
  
  await postwa.save();
   res.json({ likes: postwa.likes.length });

});

app.get('/home' , async(req , res)=>{
  let postwa=await post.find();
  res.render('home' , {postwa});
});


app.get('/login' , (req , res)=>{
  res.render('login');
});

app.post('/createpost' , isLoggedIn, async (req , res)=>{
  let {content}=req.body;
  let person=await User.findOne({email:req.user.email});
  let postwa=await post.create({
    user: person._id,
    content,
  });
  person.posts.push(postwa._id);
  await person.save();
  res.redirect('/home');
});

app.listen(3000 , 
  ()=>{
    console.log("ya it is working");
  }
);