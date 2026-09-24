require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

(async () => {
  try {
    await connectDB();

    const passwords = {
      admin: await bcrypt.hash("Admin@123", 10),
      staff: await bcrypt.hash("Staff@123", 10),
      student: await bcrypt.hash("Student@123", 10)
    };

    await User.updateOne(
      { email: "admin@edusupport.com" },
      { $setOnInsert: { name: "System Admin", email: "admin@edusupport.com", password: passwords.admin, role: "admin", department: "Administration" } },
      { upsert: true }
    );
    await User.updateOne(
      { email: "staff@edusupport.com" },
      { $setOnInsert: { name: "Priya Staff", email: "staff@edusupport.com", password: passwords.staff, role: "staff", department: "Student Services" } },
      { upsert: true }
    );
    await User.updateOne(
      { email: "student@edusupport.com" },
      { $setOnInsert: { name: "Rahul Student", email: "student@edusupport.com", password: passwords.student, role: "student", department: "CSE" } },
      { upsert: true }
    );

    console.log("Demo users ready");
    console.log("Admin: admin@edusupport.com / Admin@123");
    console.log("Staff: staff@edusupport.com / Staff@123");
    console.log("Student: student@edusupport.com / Student@123");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
