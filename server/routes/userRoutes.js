import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getCompanyDirectory,
  getCompanyManagers,
  toggleFavoriteArticle,
  deleteUser,
  createElevatedUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
// Inject Cloudinary multer middleware. Adjust path if your configuration file differs.
import { upload } from "../middleware/cloudinary.js";

const router = express.Router();

/**
 * Profile Routes
 * GET: Retrieve logged-in user data
 * PUT: Update user data (including avatar)
 * DELETE: Remove account and cleanup Cloudinary/Submissions
 */
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("avatar"), updateUserProfile)
  .delete(protect, deleteUser);

/**
 * Directory & Assignment Routes
 */
router.get("/directory", protect, getCompanyDirectory);
router.get("/managers", protect, getCompanyManagers);

/**
 * Article Interaction Routes
 */
router.patch("/favorites/:articleId", protect, toggleFavoriteArticle);

/**
 * Admin/Manager User Management
 */
router.post("/elevated", protect, createElevatedUser);

export default router;
