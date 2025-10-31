const { name } = require("ejs");
const express = require("express")
const mysql = require("mysql2")
const path = require("path")
// const ejs = require("ejs")


// var methodOverride = require('method-override')
// app.use(methodOverride('_method'))
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Lucky@@1400', // your password
  database: 'STUDENT_RESULT_MANAGEMENT_SYSTEM'
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Database connected!");
});

db.query("SHOW TABLES",(err,res) => {
    console.log(res);
    // console.log(err)
})


app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

let port = 8080;

app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(express.static(path.join(__dirname,"public")))  //This folder is for styling 

app.listen(port,() => {
    console.log("app is listening on port - ",port)
})

let err_pass = 0; //this is the boolean field which will check that in the login page which kind of error is found , error can be of two types this is refer to if my
//password is not matching to confirm password
let err_forget = 0; //this error will happen if we entered wrong password while our password and confirm_password both fields are same 
let err_email = 0; //this error will happen if email is not found in this case we have to register first

app.get("/",(req,res) => {
    // res.send("app is working")
    
    res.render("login.ejs",{err_pass,err_forget,err_email});
})

app.get("/login",(req,res) => {
    // res.send("app is working")
    res.render("login.ejs",{err_pass,err_forget,err_email});
})

// now take post request which will take data collected from the form and authenticate the data



app.post("/login", (req, res) => {
    let { email, password, confirm_password } = req.body;

    // Initialize error flags for this request
    let err_email = 0;
    let err_forget = 0;
    let err_pass = 0;

    // 1. Check if passwords match (Synchronous check)
    if (password !== confirm_password) {
        err_pass = 1;
        // Send response immediately because the error is known
        return res.render("login.ejs", { err_email, err_forget, err_pass }); //i am using return here taaki niche wala content check
        //na karna pade 
    }
    
    // 2. Passwords match, proceed to DB check (Asynchronous check)
    let q = `SELECT * FROM users WHERE email = "${email}"`;
    
    // The entire authentication logic MUST be inside the callback
    db.query(q, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            // Handle DB error (e.g., show a generic error message)
            // For now, let's redirect to login with no specific error
            return res.render("login.ejs", { err_email: 0, err_forget: 0, err_pass: 0 });
        }
        
        console.log("DB results length:", results.length); // Should be 0 in your test
        
        // --- Core Authentication Logic ---
        
        if (results.length === 0) {
            // Case 1: No user found with this email
            err_email = 1; 
            // Send response back to login page
            return res.render("login.ejs", { err_email, err_forget, err_pass });
        } else {
            // Case 2: User found, now check password
            const user = results[0];
            
            // NOTE: You should use secure password hashing (like bcrypt) in a real app
            if (user.user_password !== password) {
                // Email found but password does not match
                err_forget = 1; 
                // Send response back to login page
                return res.render("login.ejs", { err_email, err_forget, err_pass });
            } else {
                // Case 3: Email found and password matches (Success!)
                // In a real app, you would set a session here
                return res.redirect("/home");
            }
        }
    });

    // NOTE: Nothing should be here! Any code here runs too early.
});

//registration error fields - 

let err_reg_pass = 0; //pasword and confirm passwords fields are not matching 
let err_reg_email = 0; //email should be unique 
let err_reg_mobile_no = 0; //mobile no should be of 10 digits

app.get("/register",(req,res) => {
    res.render("register.ejs",{err_reg_pass,err_reg_mobile_no,err_reg_email});
})


app.post("/register",(req,res) => {

    console.log(req.body)
    let {name,email,mobile_no,password,confirm_password,security_que,ans_sec_que} = req.body;

    //now i have to do authentication , in authentication following things i need to do - 

    //1.password and confirm_pass should be match
    //2.email should be unique
    //3.mobile_no should be of 10 digits

    if(password != confirm_password){
        err_reg_pass = 1;
        //again send the response on register page to collect the correct data
        return res.render("register.ejs",{err_reg_pass,err_reg_email,err_reg_mobile_no});
    }
    else{
        if(!(1000000000 <= mobile_no && mobile_no <= 9999999999)){
            err_reg_mobile_no = 1;
            return res.render("register.ejs",{err_reg_pass,err_reg_email,err_reg_mobile_no});
        }
        else{
            //check that my email is unique or not -
            let q = `select * from users where email = "${email}"`;
            try{
                db.query(q,(error,results) => {
                    if(error) throw error;
                    // console.log(results)
                    //if user already exits then display admin to do login instead of registering 
                    if(results.length == 1){
                        err_reg_email = 1;
                        return res.render("register.ejs",{err_reg_pass,err_reg_email,err_reg_mobile_no});
                    }  
                })
            }catch(error){
                console.log(error);
            }
            //now it is confirmed that my result length is not 1 show saved this data into users database
            let count = 0; //this is done for setting the correct id , because in the table there is a column called id which is basically sequence or serial_no
            let que_1 = "select * from users";
            try{
                db.query(que_1,(err_1,res_1) => {
                    if(err_1) throw err_1;
                    console.log(res_1);
                    count = res_1.length;
                    let que = `insert into users values(${count+1},"${name}","${email}",${mobile_no},"${security_que}","${ans_sec_que}","${password}")`; 
                    try{
                        db.query(que,(error,results) => {
                            if(error) throw error;
                            console.log(results);
                        })
                    }catch(error){
                        console.log(error);
                    }
                    // console.log("data is saved");
                    res.redirect("/login");
                })
            }catch(err_1){
                console.log(err_1)
            }
        }
    }
})

let err_forget_email = 0;
let err_forget_sec_que = 0;

app.get("/forget_Password",(req,res) => {
    res.render("forget_Password.ejs",{err_forget_email,err_forget_sec_que});
})

app.post("/forget_Password",(req,res) => {
    let {email,security_que_1,ans_sec_que_1,new_password} = req.body;
    // console.log(req.body)
    //first check if the account exists or not 

    let q = `SELECT * FROM users WHERE email = "${email}"`;
    try{
        db.query(q,(error,results) => {

            if(error) throw error;
            //check if account not exists
            if(results.length == 0){
                err_forget_email = 1;
                return res.render("forget_Password.ejs",{err_forget_email,err_forget_sec_que});
            }

            //now found security question and answer of the security question with this email
            const {security_que,ans_security_que} = results[0];
            console.log("security question entered - ",security_que_1);
            console.log("ans of security question entered - ",ans_sec_que_1);
            console.log("actual security question - ",security_que);
            console.log("actual ans of security question - ",ans_security_que);
            
            //now you got all the things so check if they are matching or not -
            if(security_que_1 == security_que && ans_sec_que_1 == ans_security_que){
                //then we can say user can change his password 
                let update_query = `update users set user_password = "${new_password}" where email = "${email}"`;
                try{
                    db.query(update_query,(err_update,res_update) => {
                        if(err_update) throw err_update;
                        console.log("upadation result is" , res_update);
                    })
                }catch(err_update){
                    console.log(err_update);
                }
                return res.redirect("/login");
            }
                //security que and answer of security question mismatched
                err_forget_sec_que = 1; 
                return res.render("forget_Password.ejs",{err_forget_email,err_forget_sec_que});

        })
    }catch(error){
        console.log(error);
    }
    // res.send("Password reset succesfully")
})

app.get("/home",(req,res) => {
    res.send("login succesfully!")
})