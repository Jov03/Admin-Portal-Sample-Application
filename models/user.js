var mongoose=require('mongoose'),
    passportLocalMongoose=require('passport-local-mongoose');

var UserSchema=new mongoose.Schema({
    username:String,
    password:String,
    Role:String,
    email:String,
    mobile:Number
});

UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",UserSchema);