var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    methodOverride=require("method-override"),
    flash=require('connect-flash'),
    User = require("./models/user"),
    Company=require("./models/Company");
app = express();

//Connect to DB
mongoose.connect('mongodb://localhost/VisionFirst');
// mongoose.connect('mongodb://'+process.env.COSMOSDB_USERNAME+'.documents.azure.com:10255/jovblog?ssl=true', {
//     auth: {
//         user: process.env.COSMOSDB_USERNAME,
//         password: process.env.COSMOSDB_PASSWORD
//     }
//     })
//     .then(() => console.log('connection successful'))
//     .catch((err) => console.error(err));


app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(flash());
app.use(methodOverride('_method'));



//Serve Resources
app.use(express.static("public"));

app.use(require('express-session')({
    secret: 'sadasfdsagrgawrgerw',
    resave: false,
    saveUninitialized: false
}));

app.use((req,res,next)=>{
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//MiddleWare To provide UserData to all templates
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
});

//MiddleWare to Restrict access with log In
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please Login First!");
    res.redirect('/login');
}


//ROUTES



//Login Page
app.get('/', (req, res) => {
    res.redirect('/login');
});
app.get('/login', (req, res) => {
    res.render('login');
   
});

//Logout Route
app.get("/logout",(req,res)=>{
    req.logout();
    req.flash("success","Logged Out");
    res.redirect('/login');
});

//Authenticate User then login 
app.post('/login', passport.authenticate("local", {
    successRedirect: '/AdminView',
    failureRedirect: '/login',
    failureFlash:true
}), (req, res) => {

});

//Register A New User
app.get('/Register', (req, res) => {
    res.render("register");
});
app.post('/Register',(req,res)=>{
    if(req.body.password==req.body.confirmpassword){
        User.register(new User({username:req.body.username,Role:req.body.role,email:req.body.email,mobile:req.body.mobile}),req.body.password,(err,user)=>{
            if(err){
            
                return res.render('register');
            }
            passport.authenticate("local")(req,res,()=>{
                res.redirect('/AdminView');
            });
        });
    }else{
        res.render("register");
    }
});

//User View Based of User Role
app.get('/AdminView',isLoggedIn, (req, res) => {
    if(req.user.Role=="IT_ADMIN"){
        res.render('AdminView');
    }
    else{
        res.redirect("/Company/new");
    }
});
app.get('/Company/new',isLoggedIn, (req, res) => {
    res.render("CreateCompany");
   
});

//CRUD On CompanySchema Routes
app.get("/Company",(req,res)=>{
    Company.find({},(err,companies)=>{
        if(err){
            res.send(err);
        }else{
            res.send(companies);
        }
    })
});
app.post('/Company/new',isLoggedIn,(req,res)=>{
    if(req.user.Role=="IT_ADMIN"){
        req.body.Company.Approved=true;
    }
    Company.create(req.body.Company,(err,newCompany)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/Company/new");
        }

    });
});
app.get('/Company/:id/edit',isLoggedIn,(req,res)=>{
    Company.findById(req.params.id,(err,foundCompany)=>{
        if(err){
            res.redirect("/AdminView");
        }else{
            res.render("EditCompany",{company:foundCompany});
        }
    })
})
app.put("/Company/:id",isLoggedIn,(req,res)=>{
    Company.findByIdAndUpdate(req.params.id,req.body.Company,(err,newBlog)=>{
        if(err){
            console.log(err);
        }else{
            console.log(newBlog);
            res.redirect("/AdminView");
        }
    });
});
app.put("/Company/:id/approve",isLoggedIn,(req,res)=>{
    Company.findById(req.params.id,(err,foundCompany)=>{
        if(err){
            console.log("error");
        }else{
            foundCompany.Approved=true;
            Company.findByIdAndUpdate(req.params.id,foundCompany,(err,updatedCompany)=>{
                if(err){
                    console.log("error");
                }else{
                    res.render("AdminView");
                }
            })
        }
    })
})
app.delete("/Company/:id",isLoggedIn,(req,res)=>{
    Company.findByIdAndRemove(req.params.id,(err,deletedCompany)=>{
        if(err){
            console.log(err);
        }else{
            console.log(deletedCompany);
            res.render("AdminView");
        }
    });
});







//Redirect to login page if request doesnot match any other route
app.get("*", (req, res) => {
    if(!req.isAuthenticated){
        res.redirect('/login');
    }else{
        res.redirect("/AdminView");
    }
});



//Start Server 
app.listen(process.env.PORT || 5050, () => {
    console.log("Server Started");

});