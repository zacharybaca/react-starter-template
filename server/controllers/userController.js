import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("companyId", "name imageUrl") // Added imageUrl here
    .populate("managerId", "firstName lastName email")
    .select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    // Handle Cloudinary Avatar Upload via multer middleware
    if (req.file) {
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      department: updatedUser.department, // CRITICAL: Added department
      companyId: updatedUser.companyId,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc    Get all employees within the same company
 * @route   GET /api/users/directory
 * @access  Private
 */
const getCompanyDirectory = asyncHandler(async (req, res) => {
  const users = await User.find({ companyId: req.user.companyId })
    .select("firstName lastName email role avatar")
    .sort({ lastName: 1 });

  res.json(users);
});

/**
 * @desc    Get list of Managers for assignment
 * @route   GET /api/users/managers
 * @access  Private
 */
const getCompanyManagers = asyncHandler(async (req, res) => {
  const managers = await User.find({
    companyId: req.user.companyId,
    role: "Manager",
  }).select("firstName lastName _id");

  res.json(managers);
});

/**
 * @desc    Toggle article in favorites list
 * @route   PATCH /api/users/favorites/:articleId
 * @access  Private
 */
const toggleFavoriteArticle = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { articleId } = req.params;

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const index = user.favoriteArticles.indexOf(articleId);

  if (index === -1) {
    user.favoriteArticles.push(articleId);
  } else {
    user.favoriteArticles.splice(index, 1);
  }

  await user.save();
  res.json({
    message: index === -1 ? "Added to favorites" : "Removed from favorites",
    favoriteArticles: user.favoriteArticles,
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/profile
 * @access  Private
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Triggers the pre('deleteOne') hook for Cloudinary/Cascade cleanup
    await user.deleteOne();
    res.json({ message: "Account deleted successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc    Create a new Admin or Manager account
 * @route   POST /api/users/elevated
 * @access  Private (Admin/Manager Only)
 */
const createElevatedUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin" && req.user.role !== "Manager") {
    res.status(403);
    throw new Error("Not authorized to create accounts");
  }

  const { firstName, lastName, email, password, department, role } = req.body;

  if (!["Employee", "Manager", "Admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role selection");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    companyId: req.user.companyId,
    department,
    role,
    isVerified: true,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export {
  getUserProfile,
  updateUserProfile,
  getCompanyDirectory,
  getCompanyManagers,
  toggleFavoriteArticle,
  deleteUser,
  createElevatedUser,
};
