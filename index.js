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