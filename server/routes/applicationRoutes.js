import express from "express";
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getApplications);
router.get("/:id", protect, getApplicationById);
router.post("/", protect, admin, createApplication);
router.put("/:id", protect, admin, updateApplication);
router.delete("/:id", protect, admin, deleteApplication);

export default router;
