# 🎓 Student Management System

A comprehensive web-based application for managing student records, courses, and results with an intuitive interface and robust features.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication System
- **User Registration** with validation
  - Unique email validation
  - Password confirmation
  - Mobile number validation (10 digits)
  - Security question setup
- **User Login** with error handling
- **Password Recovery** using security questions

### 📚 Course Management
- ➕ **Add New Courses** with details:
  - Course name (unique)
  - Duration
  - Charges
  - Description
- ✏️ **Edit Course** information
- 🗑️ **Delete Courses**
- 📊 **View All Courses** in a structured format

### 👨‍🎓 Student Management
- ➕ **Add Students** with comprehensive details:
  - Roll number (unique identifier)
  - Personal information (name, email, gender)
  - Contact details (phone, address, city, state, pincode)
  - Course enrollment
  - Admission date
- 🔍 **Search Students** by roll number
- ✏️ **Edit Student** profiles
- 🗑️ **Delete Student** records
- 📋 **View All Students**

### 📈 Result Management
- 📝 **Add Student Results**
  - Marks obtained
  - Total marks
  - Automatic percentage calculation
- 📊 **View All Results** with student details
- 🔍 **View Individual Results** by roll number
- 📄 **Download Results as PDF** with:
  - Professional formatting
  - Student information
  - Academic performance
  - Percentage calculation
  - Color-coded report

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL2** - Database driver

### Frontend
- **EJS** - Templating engine
- **HTML/CSS** - Structure and styling

### Additional Libraries
- **PDFKit** - PDF generation
- **Path** - File path utilities
- **File System (fs)** - File operations

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) - [Download](https://www.mysql.com/downloads/)
- **npm** (comes with Node.js)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Lucky-Gehlot/DBMS-MAJOR-PROJECT---STUDENT-MANAGEMENT-SYSTEM.git
cd DBMS-MAJOR-PROJECT---STUDENT-MANAGEMENT-SYSTEM
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- ejs
- pdfkit

### 3. Configure Database Connection

Create or update the database configuration in your main file. Add the following code before the `db.connect()` line:

```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_username',      // Replace with your MySQL username
    password: 'your_mysql_password',  // Replace with your MySQL password
    database: 'student_management'    // Database name
});
```

### 4. Update Port Configuration

In your main file, ensure the port is defined:

```javascript
const PORT = process.env.PORT || 8080;
const port = PORT; // Add this line if needed

app.listen(port, () => {
    console.log("app is listening on port - ", port)
})
```

---

## 🗄️ Database Setup

### 1. Create Database

```sql
CREATE DATABASE student_management;
USE student_management;
```

### 2. Create Tables

#### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile_no BIGINT NOT NULL,
    security_que VARCHAR(255) NOT NULL,
    ans_security_que VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);
```

#### Courses Table
```sql
CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(100) UNIQUE NOT NULL,
    duration VARCHAR(50) NOT NULL,
    charges DECIMAL(10, 2) NOT NULL,
    description TEXT
);
```

#### Students Table
```sql
CREATE TABLE students (
    roll_no INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    state VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    pincode INT NOT NULL,
    course VARCHAR(100) NOT NULL,
    contact_no BIGINT NOT NULL,
    admission_date DATE NOT NULL,
    address TEXT NOT NULL
);
```

#### Results Table
```sql
CREATE TABLE results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roll_no INT NOT NULL,
    marks_obtained INT NOT NULL,
    total_marks INT NOT NULL,
    FOREIGN KEY (roll_no) REFERENCES students(roll_no) ON DELETE CASCADE
);
```

---

## 💻 Usage

### Starting the Application

```bash
node app.js
# or if you're using nodemon
nodemon app.js
```

The application will start on `http://localhost:8080`

### Accessing the Application

1. **Open your browser** and navigate to `http://localhost:8080`
2. **Register** a new account or **Login** if you already have one
3. Start managing courses, students, and results!

---

## 📁 Project Structure

```
student-management-system/
│
├── public/                 # Static files (CSS, images, JS)
│   ├── css/
│   ├── js/
│   └── images/
│
├── views/                  # EJS templates
│   ├── login.ejs
│   ├── register.ejs
│   ├── forget_Password.ejs
│   ├── home.ejs
│   ├── courses.ejs
│   ├── course_edit.ejs
│   ├── students.ejs
│   ├── add_students.ejs
│   ├── student_edit.ejs
│   ├── student.ejs
│   ├── results.ejs
│   ├── allResults.ejs
│   └── resultDetail.ejs
│
├── app.js                  # Main application file
├── package.json           # Project dependencies
└── README.md             # Project documentation
```

---

## 🌐 API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home/Login page |
| GET | `/login` | Login page |
| POST | `/login` | Authenticate user |
| GET | `/register` | Registration page |
| POST | `/register` | Register new user |
| GET | `/forget_Password` | Password recovery page |
| POST | `/forget_Password` | Reset password |

### Course Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | View all courses |
| POST | `/courses` | Add new course |
| GET | `/edit-course?id=:id` | Edit course page |
| POST | `/edit-course?id=:id` | Update course |
| GET | `/delete-course?id=:id` | Delete course |

### Student Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | View all students |
| GET | `/add_student` | Add student page |
| POST | `/add_student` | Add new student |
| POST | `/student` | Search student by roll no |
| GET | `/edit-student?id=:id` | Edit student page |
| POST | `/edit-student?id=:id` | Update student |
| GET | `/delete-student?id=:id` | Delete student |

### Result Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/results` | Results page |
| GET | `/get-student/:roll_no` | Get student by roll no |
| POST | `/save-result` | Save student result |
| GET | `/view-results` | View all results |
| GET | `/result/:id` | View specific result |
| GET | `/download/:id` | Download result PDF |

---

## 📸 Screenshots

*Add screenshots of your application here*

```markdown
### Login Page
![Login](/screenshots/login_page.png)

### Home Page
![home](/screenshots/home.png)

### Register Page
![register](/screenshots/register_page.png)
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a new branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## ⚠️ Important Notes

### Security Considerations

> **⚠️ Warning:** This project stores passwords in plain text, which is **NOT SECURE** for production use.

**Recommended improvements:**
- Implement password hashing using `bcrypt`
- Add session management using `express-session`
- Implement CSRF protection
- Use prepared statements to prevent SQL injection
- Add input validation and sanitization

### SQL Injection Prevention

The current implementation is vulnerable to SQL injection. Consider using parameterized queries:

```javascript
// Instead of:
let q = `SELECT * FROM users WHERE email = "${email}"`;

// Use:
let q = `SELECT * FROM users WHERE email = ?`;
db.query(q, [email], (error, results) => {
    // Handle results
});
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Lucky Gehlot**

- GitHub: [@Lucky-Gehlot](https://github.com/Lucky-Gehlot)
- Project Link: [Student Management System](https://github.com/Lucky-Gehlot/DBMS-MAJOR-PROJECT---STUDENT-MANAGEMENT-SYSTEM)

---

## 🙏 Acknowledgments

- Thanks to all contributors who help improve this project
- Inspired by real-world student management needs
- Built with ❤️ for educational purposes

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Lucky-Gehlot/DBMS-MAJOR-PROJECT---STUDENT-MANAGEMENT-SYSTEM/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide detailed information about the error

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made with ❤️ by Lucky Gehlot

</div>