var mongoose=require("mongoose");

var CompanySchema=new mongoose.Schema({
    CompanyName:String,
    Address:String,
    CreatedBy:String,
    Approved:{type:Boolean,default:false}
});
module.exports=mongoose.model("Company",CompanySchema);