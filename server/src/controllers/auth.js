const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function createToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    active: user.active
  };
}

exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (
      !user ||
      !user.active ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (role && user.role !== role) {
      return res.status(401).json({
        message: `This account is registered as ${user.role}. Select the correct role.`
      });
    }

    res.json({
      token: createToken(user._id),
      user: safeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      department
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "student",
      department: department || ""
    });

    res.status(201).json({
      token: createToken(user._id),
      user: safeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({
    user: safeUser(req.user)
  });
};

/*
 * Update profile
 * Currently allows the user to change:
 * - Name
 * - Department
 *
 * Email and role are intentionally not editable here.
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, department } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    if (name.trim().length > 80) {
      return res.status(400).json({
        message: "Name cannot exceed 80 characters"
      });
    }

    req.user.name = name.trim();

    if (department !== undefined) {
      req.user.department = department.trim();
    }

    await req.user.save();

    res.json({
      message: "Profile updated successfully",
      user: safeUser(req.user)
    });
  } catch (error) {
    next(error);
  }
};

/*
 * Change password
 *
 * The current password is required.
 * This prevents someone who only has access to
 * an unlocked browser session from silently
 * changing the account password.
 */
exports.changePassword = async (req,res,next)=>{
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters"
      });
    }

    // Fetch the user again WITH the password hash
    const user = await User.findById(req.user._id).select("+password");

    if (!user || !user.active) {
      return res.status(401).json({
        message: "User not found or inactive"
      });
    }

    // Check current password
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Current password is incorrect"
      });
    }

    // Prevent using the same password
    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json({
        message: "New password must be different from your current password"
      });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    // Issue a fresh token
    const token = createToken(user._id);

    res.json({
      message: "Password changed successfully",
      token,
      user: safeUser(user)
    });

  } catch (error) {
    console.error("Change password error:", error);
    next(error);
  }
};