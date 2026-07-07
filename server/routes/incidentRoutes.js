import express from "express";
import {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  addComment,
  getIncidentStats,
} from "../controllers/incidentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, getIncidentStats);
router.get("/", protect, getIncidents);
router.get("/:id", protect, getIncidentById);
router.post("/", protect, createIncident);
router.put("/:id", protect, updateIncident);
router.delete("/:id", protect, admin, deleteIncident);
router.post("/:id/comments", protect, addComment);

export default router;
