const mongoose=require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/authtest');
const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    age:Number,
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }]
});
module.exports=mongoose.model("apneLog" , userSchema);