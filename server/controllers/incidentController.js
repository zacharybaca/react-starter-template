import asyncHandler from "express-async-handler";
import Incident from "../models/Incident.js";

// @desc    Get incidents with filtering, sorting, and pagination
// @route   GET /api/incidents
// @access  Private
const getIncidents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    severity,
    application,
    assignedTo,
    search,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (severity) filter.severity = severity;
  if (application) filter.application = application;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.$text = { $search: search };

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy]: order === "asc" ? 1 : -1 },
    populate: [
      { path: "application", select: "name environment status" },
      { path: "assignedTo", select: "name username" },
      { path: "createdBy", select: "name username" },
      { path: "comments.author", select: "name username" },
    ],
  };

  const result = await Incident.paginate(filter, options);

  res.status(200).json({
    incidents: result.docs,
    total: result.totalDocs,
    page: result.page,
    pages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  });
});

// @desc    Get a single incident by ID
// @route   GET /api/incidents/:id
// @access  Private
const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate("application", "name environment status version")
    .populate("assignedTo", "name username email")
    .populate("createdBy", "name username")
    .populate("comments.author", "name username");

  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  res.status(200).json(incident);
});

// @desc    Create a new incident
// @route   POST /api/incidents
// @access  Private
const createIncident = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    application,
    priority,
    severity,
    reportedBy,
    assignedTo,
    tags,
    estimatedResolutionTime,
  } = req.body;

  const incident = await Incident.create({
    title,
    description,
    application,
    priority,
    severity,
    reportedBy,
    assignedTo: assignedTo || null,
    tags,
    estimatedResolutionTime,
    createdBy: req.user._id,
  });

  await incident.populate([
    { path: "application", select: "name environment" },
    { path: "assignedTo", select: "name username" },
    { path: "createdBy", select: "name username" },
  ]);

  // Emit real-time event so connected clients update instantly
  const io = req.app.get("io");
  if (io) {
    io.emit("incident:created", incident);
  }

  res.status(201).json(incident);
});

// @desc    Update an incident (status, priority, assignee, etc.)
// @route   PUT /api/incidents/:id
// @access  Private
const updateIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  const {
    title,
    description,
    application,
    status,
    priority,
    severity,
    reportedBy,
    assignedTo,
    tags,
    resolution,
    estimatedResolutionTime,
  } = req.body;

  incident.title = title ?? incident.title;
  incident.description = description ?? incident.description;
  incident.application = application ?? incident.application;
  incident.status = status ?? incident.status;
  incident.priority = priority ?? incident.priority;
  incident.severity = severity ?? incident.severity;
  incident.reportedBy = reportedBy ?? incident.reportedBy;
  incident.assignedTo = assignedTo !== undefined ? assignedTo : incident.assignedTo;
  incident.tags = tags ?? incident.tags;
  incident.resolution = resolution ?? incident.resolution;
  incident.estimatedResolutionTime =
    estimatedResolutionTime ?? incident.estimatedResolutionTime;

  const updated = await incident.save();

  await updated.populate([
    { path: "application", select: "name environment" },
    { path: "assignedTo", select: "name username" },
    { path: "createdBy", select: "name username" },
    { path: "comments.author", select: "name username" },
  ]);

  const io = req.app.get("io");
  if (io) {
    io.emit("incident:updated", updated);
  }

  res.status(200).json(updated);
});

// @desc    Delete an incident
// @route   DELETE /api/incidents/:id
// @access  Private (Admin)
const deleteIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  await incident.deleteOne();

  const io = req.app.get("io");
  if (io) {
    io.emit("incident:deleted", { _id: req.params.id });
  }

  res.status(200).json({ message: "Incident removed" });
});

// @desc    Add a comment to an incident
// @route   POST /api/incidents/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    res.status(404);
    throw new Error("Incident not found");
  }

  const { body } = req.body;
  if (!body || !body.trim()) {
    res.status(400);
    throw new Error("Comment body is required");
  }

  incident.comments.push({ author: req.user._id, body: body.trim() });
  await incident.save();

  await incident.populate("comments.author", "name username");

  const newComment = incident.comments[incident.comments.length - 1];

  const io = req.app.get("io");
  if (io) {
    io.emit("incident:comment_added", { incidentId: incident._id, comment: newComment });
  }

  res.status(201).json(newComment);
});

// @desc    Get incident summary statistics
// @route   GET /api/incidents/stats
// @access  Private
const getIncidentStats = asyncHandler(async (req, res) => {
  const [statusCounts, priorityCounts, recentOpen] = await Promise.all([
    Incident.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Incident.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    Incident.countDocuments({ status: { $in: ["open", "in_progress"] } }),
  ]);

  const byStatus = Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]));
  const byPriority = Object.fromEntries(
    priorityCounts.map(({ _id, count }) => [_id, count]),
  );

  res.status(200).json({
    byStatus,
    byPriority,
    openAndInProgress: recentOpen,
    total: Object.values(byStatus).reduce((sum, n) => sum + n, 0),
  });
});

export {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  addComment,
  getIncidentStats,
};
