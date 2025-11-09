const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Lucky@@1400', // your password
  database: 'STUDENT_RESULT_MANAGEMENT_SYSTEM'
});

const { name } = require("ejs");
const express = require("express")
const mysql = require("mysql2")
const path = require("path")
const PDFDocument = require('pdfkit');
const fs = require('fs');
// const ejs = require("ejs")


// var methodOverride = require('method-override')
// app.use(methodOverride('_method'))
const app = express();


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

const PORT = process.env.PORT || 8080;

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
                return res.render("home.ejs");
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

// app.get("/home",(req,res) => {
//     res.redirect("home.ejs");
// })
//

let err_course = 0;
let succ_course = 0;
let courses;

app.get("/courses",(req,res) => {
    let q_cnt_course = "select * from courses";
    
    db.query(q_cnt_course,(error,result) => {
        courses = result;
        return res.render("courses.ejs",{err_course,succ_course,courses});
    })
})

app.post("/courses",(req,res) => {

    //taking data
    const {course_name,course_duration,course_charges,course_description} = req.body;
    
    //now authenticate details
    //1.course_name should be unique

    let q = `select * from courses where course_name = "${course_name}"`;
    try{
        db.query(q,(error,results) => {
            if(error) throw error;
            if(results.length != 0){
                err_course = 1;
                return res.render("courses.ejs",{err_course,succ_course,courses})
            }
        })
    }catch(error){
        console.log(error);
    }

    //course is not there so please add this course in the database 

    // for it first you need count of all courses
    let id_cnt = 0;

    let q_cnt_course = "select * from courses";
    try{
        db.query(q_cnt_course,(error,results) => {
            if(error) throw error;
            // id_cnt = results.length;
            id_cnt = results.length;
            let q_ins_course = `insert into courses values (${id_cnt+1},"${course_name}","${course_duration}",${course_charges},"${course_description}");`
            try{
                db.query(q_ins_course,(err_1,res_1) => {
                    if(err_1) throw err_1;
                    succ_course = 1;
            
                    //after inserting new data find updated courses
                    let q_cnt_course = "select * from courses";
                    db.query(q_cnt_course,(error,result) => {
                        if(error) console.log(error);
                        courses = result;
                        return res.render("courses.ejs",{err_course,succ_course,courses});
                    })        
                })
            }catch(err_1){
                console.log(err_1);
            }
        })
    }catch(error){
        console.log(error);
    }
})



app.get('/edit-course', (req, res) => {
    const courseId = req.query.id;
    // Fetch course data and render edit form
    let q = `select * from courses where course_id = ${courseId}`;
    try{
        db.query(q,(error,results) => {
            if(error) throw error;
            if(results.length == 0){
                // err_course = 1;
                
                return res.render("courses.ejs",{err_course,succ_course,courses})
            }
            return res.render("course_edit.ejs",{courseId,results});
        })
    }catch(error){
        console.log(error);
    }
    
});


app.post('/edit-course',(req,res) => {
    const courseId = req.query.id;
    const {course_name,course_duration,course_charges,course_description} = req.body;
    console.log(req.body);
    console.log(courseId)
    let q = `update courses set course_name = "${course_name}" ,duration = "${course_duration}" ,charges = ${course_charges} ,description = "${course_description}" where course_id = ${courseId}` ;
    try{
        db.query(q,(error,results) => {
            if(error) throw error;
            console.log(results);
            // alert("course updated succesfully");
            return res.redirect("/courses");
        })
    }catch(error){
        console.log(error);
    }
})


app.get("/delete-course",(req,res) => {
    const courseId = req.query.id;
    let del_q = `delete from courses where course_id = ${courseId}`;
    try{
        db.query(del_q,(error,results) => {
            if(error) throw error;
            console.log(results);
            // alert("course updated succesfully");

            return res.redirect("/courses");
        })
    }catch(error){
        console.log(error);
    }
})

let err_search_stu_roll_no = 0; //field for searching student name and we caught any error

app.get("/students",(req,res) => {
    let q_show_students = "select * from students";
    try{
        db.query(q_show_students,(error,students) => {
            if(error) throw error;
            return res.render("students.ejs",{students,err_search_stu_roll_no});
        })
    }catch(error){
        console.log(error);
    }
})


let err_student_roll_no = 0;
app.get("/add_student",(req,res) => {

    //first collect all the course data and send all the course data to another page
    let q_cnt_course = "select * from courses";
    try{
        db.query(q_cnt_course,(error,courses) => {
            if(error) throw error;
            return res.render("add_students.ejs",{courses,err_student_roll_no});
        })
    }catch(error){
        console.log(error);
    }
})


app.post("/add_student",(req,res) => {
    console.log(req.body);
    const {roll_no,name,email,gender,state,city,pincode,course,contact_no,addmission_date,address} = req.body;
    //first check roll no should be unique
    let chk_roll_no = `select * from students where roll_no = ${roll_no}`;
    try{
        db.query(chk_roll_no,(error,results) => {
            if(error) throw error;
            if(results.length != 0){
                err_student_roll_no = 1;
                return res.render("add_students.ejs",{courses,err_student_roll_no});
            }
        })
    }catch(error){
        console.log(error);
    }
    //roll no isunique add into database
    let add_roll_no = `insert into students values (${roll_no},"${name}","${email}","${gender}","${state}","${city}",${pincode},"${course}",${contact_no},"${addmission_date}","${address}")`;
    try{
        db.query(add_roll_no,(error,results) => {
            if(error) throw error;
            return res.redirect("/students");
        })
    }catch(error){
        console.log(error);
    }
})


app.post("/student",(req,res) => {
    const {roll_no} = req.body;
    let chk_roll_no = `select * from students where roll_no = ${roll_no}`;
    try{
        db.query(chk_roll_no,(error,results) => {
            if(error) throw error;

            if(results.length == 0){
                err_search_stu_roll_no = 1;
                return res.render("students.ejs",{err_search_stu_roll_no});
            }
            else return res.render("student.ejs",{results})            
        })
    }catch(error){
        console.log(error);
    }
})

app.get('/edit-student', (req, res) => {
    const rollNO = req.query.id;
    // Fetch course data and render edit form
    let chk_roll_no = `select * from students where roll_no = ${rollNO}`;
    try{
        db.query(chk_roll_no,(error,results) => {
            if(error) throw error;
            let crs = [];
            if(results.length == 0) return res.render("students.ejs",{crs,err_search_stu_roll_no});
            let q_cnt_course = "select * from courses";
            try{
                db.query(q_cnt_course,(err,crs) => {
                    if(err) throw err;
                    
                    return res.render("student_edit.ejs",{crs,results});
                })
            }catch(err){
                console.log(err);
            }           
        })
    }catch(error){
        console.log(error);
    }
});

app.post("/edit-student",(req,res) =>{
    const rollNO = req.query.id;
    //before update we should ensure one thing that course should be selected from our course list
    console.log(req.body)
    const {name,email,gender,state,city,pincode,course,contact_no,addmission_date,address} = req.body;

    let update_q = `update students set name = "${name}",email = "${email}",gender = "${gender}",state = "${state}",city = "${city}",pincode = ${pincode},course = "${course}",contact_no = ${contact_no},admission_date = "${addmission_date}",address = "${address}" where roll_no = ${rollNO}`;
    try{
        db.query(update_q,(err,result) => {
            if(err) throw err;
            let q_show_students = "select * from students";
            try{
                db.query(q_show_students,(error,students) => {
                    if(error) throw error;
                    return res.render("students.ejs",{students,err_search_stu_roll_no});
                })
            }catch(error){
                console.log(error);
            }
        })
    }catch(err){
        console.log(err);
    }
})

app.get("/delete-student",(req,res) => {
    const rollNo = req.query.id;
    let del_q = `delete from students where roll_no = ${rollNo}`;
    try{
        db.query(del_q,(error,results) => {
            if(error) throw error;
            console.log(results);
            // alert("course updated succesfully");

            return res.redirect("/students");
        })
    }catch(error){
        console.log(error);
    }
})


let err_result_roll_no = 0;
let roll_no = 0;

app.get("/results",(req,res) => {
    //take roll no from user- 
    res.render("results.ejs",{roll_no});
})

app.get("/get-student/:roll_no",(req,res) => {
    const {roll_no} = req.params;
    console.log(roll_no);
    db.query('SELECT * FROM students WHERE roll_no = ?', [roll_no], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send({ message: 'Student not found' });
        res.send(results[0]);
    });
})


app.post('/save-result', (req, res) => {
    const { roll_no, marks_obtained, total_marks } = req.body;
    db.query('INSERT INTO results (roll_no, marks_obtained, total_marks) VALUES (?, ?, ?)',
        [roll_no, marks_obtained, total_marks],
        (err) => {
            if (err) return res.status(500).send(err);
            return res.redirect('view-results'); //iski jagah view-results ka page display karao
        });
});

// app.get("/add_result",(req,res) => {
//     const {roll_no} = req.query.id;
//     console.log(roll_no);
//     //add the result and keep roll_no aa
// })


app.get('/view-results',(req,res) => {
    const query = `
        SELECT s.roll_no, s.name, s.course, r.marks_obtained, r.total_marks
        FROM results r
        JOIN students s ON r.roll_no = s.roll_no
        ORDER BY s.roll_no ASC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.render('allResults', { results });
    });
})


app.get('/result/:id',(req,res) => {
    const roll_no = req.params.id;
    const query = `
        SELECT s.roll_no, s.name, s.email, s.course, r.marks_obtained, r.total_marks
        FROM results r
        JOIN students s ON r.roll_no = s.roll_no
        WHERE r.roll_no = ?
    `;
    db.query(query, [roll_no], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Result not found');
        res.render('resultDetail', { result: result[0] });
    });
})


app.get('/download/:id', (req, res) => {
    const roll_no = req.params.id;
    const query = `
        SELECT s.roll_no, s.name, s.email, s.course, r.marks_obtained, r.total_marks
        FROM results r
        JOIN students s ON r.roll_no = s.roll_no
        WHERE r.roll_no = ?
    `;
    db.query(query, [roll_no], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send('Result not found');

        const data = result[0];
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Disposition', `attachment; filename=Result_${data.roll_no}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        // Colors
        const primaryColor = '#1e3a8a';    // Navy blue
        const secondaryColor = '#3b82f6';  // Blue
        const accentColor = '#06b6d4';     // Cyan
        const successColor = '#10b981';    // Green
        const textColor = '#1f2937';       // Dark gray

        // Header with gradient effect (simulated with rectangles)
        doc.rect(0, 0, doc.page.width, 150).fill('#1e3a8a');
        doc.rect(0, 0, doc.page.width, 150).fillOpacity(0.8).fill('#3b82f6');

        // // Institution Logo/Icon (circle)
        // doc.circle(doc.page.width / 2, 60, 35)
        //    .lineWidth(3)
        //    .stroke('#ffffff');
        
        // doc.fontSize(16)
        //    .fillColor('#ffffff')
        //    .text('🎓', doc.page.width / 2 - 10, 50);

        // Title
        doc.fontSize(28)
           .font('Helvetica-Bold')
           .fillColor('#ffffff')
           .text('STUDENT RESULT REPORT', 50, 110, {
               align: 'center',
               width: doc.page.width - 100
           });

        // Reset position
        doc.y = 180;

        // Date and Report ID
        const currentDate = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        doc.fontSize(10)
           .fillColor(textColor)
           .font('Helvetica')
           .text(`Report Generated: ${currentDate}`, 50, doc.y, { align: 'right' })
           .text(`Report ID: RES-${data.roll_no}-${Date.now()}`, 50, doc.y, { align: 'right' });

        doc.moveDown(2);

        // Student Information Section
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text('Student Information', 50, doc.y);
        
        // Blue underline
        doc.moveTo(50, doc.y + 5)
           .lineTo(200, doc.y + 5)
           .lineWidth(3)
           .stroke(secondaryColor);

        doc.moveDown(1.5);

        // Student Info Table
        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 200;
        const rowHeight = 35;

        // Table background
        doc.rect(col1X, tableTop, 500, rowHeight * 4)
           .fillOpacity(0.05)
           .fill(primaryColor);

        const studentInfo = [
            { label: 'Roll Number', value: data.roll_no },
            { label: 'Student Name', value: data.name },
            { label: 'Email Address', value: data.email },
            { label: 'Course', value: data.course }
        ];

        studentInfo.forEach((info, index) => {
            const yPos = tableTop + (index * rowHeight) + 10;
            
            // Row separator
            if (index > 0) {
                doc.moveTo(col1X, yPos - 5)
                   .lineTo(col1X + 500, yPos - 5)
                   .lineWidth(1)
                   .strokeOpacity(0.1)
                   .stroke(textColor);
            }

            // Label
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillOpacity(1)
               .fillColor(primaryColor)
               .text(info.label, col1X + 15, yPos);

            // Value
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor(textColor)
               .text(info.value, col2X + 15, yPos);
        });

        doc.moveDown(4);

        // Academic Performance Section
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text('Academic Performance', 50, doc.y);
        
        doc.moveTo(50, doc.y + 5)
           .lineTo(240, doc.y + 5)
           .lineWidth(3)
           .stroke(secondaryColor);

        doc.moveDown(1.5);

        // Performance Table
        const perfTableTop = doc.y;
        const perfRowHeight = 45;
        
        // Table Header
        doc.rect(50, perfTableTop, 500, perfRowHeight)
           .fill(secondaryColor);

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#ffffff')
           .text('Marks Obtained', 70, perfTableTop + 15, { width: 150 })
           .text('Total Marks', 240, perfTableTop + 15, { width: 150 })
           .text('Percentage', 410, perfTableTop + 15, { width: 120 });

        // Table Data Row
        const dataRowY = perfTableTop + perfRowHeight;
        doc.rect(50, dataRowY, 500, perfRowHeight)
           .fillOpacity(0.03)
           .fill(primaryColor);

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillOpacity(1)
           .fillColor(textColor)
           .text(data.marks_obtained.toString(), 70, dataRowY + 15, { width: 150 })
           .text(data.total_marks.toString(), 240, dataRowY + 15, { width: 150 });

        // Calculate percentage
        const percentage = ((data.marks_obtained / data.total_marks) * 100).toFixed(2);
        const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor(successColor)
           .text(`${percentage}%`, 410, dataRowY + 15, { width: 120 });

        doc.moveDown(3);

        // Grade Section
        // doc.fontSize(14)
        //    .font('Helvetica-Bold')
        //    .fillColor(primaryColor)
        //    .text('Grade: ', 50, doc.y, { continued: true })
        //    .fontSize(18)
        //    .fillColor(successColor)
        //    .text(grade);

        // // Status Badge
        // const status = percentage >= 60 ? 'PASSED' : 'FAILED';
        // const statusColor = percentage >= 60 ? successColor : '#ef4444';

        // doc.moveDown(1);
        // doc.roundedRect(50, doc.y, 120, 10, 20)
        //    .fill(statusColor);

        // doc.fontSize(14)
        //    .font('Helvetica-Bold')
        //    .fillColor('#ffffff')
        //    .text(status, 50, doc.y - 35 + 10, { width: 120, align: 'center' });

        // Footer
        // const footerY = doc.page.height - 100;
        
        // doc.moveTo(50, footerY)
        //    .lineTo(doc.page.width - 50, footerY)
        //    .lineWidth(2)
        //    .stroke(secondaryColor);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(textColor)
           .text('This is a computer-generated document. No signature is required.', 50, footerY + 15, {
               align: 'center',
               width: doc.page.width - 100
           });

        doc.fontSize(9)
           .fillColor('#6b7280')
           .text('© 2025 Student Management System. All rights reserved.', 50, footerY + 35, {
               align: 'center',
               width: doc.page.width - 100
           });

        doc.end();
    });
});
