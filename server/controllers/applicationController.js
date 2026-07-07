import asyncHandler from "express-async-handler";
import Application from "../models/Application.js";

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
const getApplications = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: "i" };

  const applications = await Application.find(filter)
    .populate("createdBy", "name username")
    .sort({ name: 1 });

  res.status(200).json(applications);
});

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate(
    "createdBy",
    "name username",
  );

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  res.status(200).json(application);
});

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private (Admin)
const createApplication = asyncHandler(async (req, res) => {
  const { name, description, owner, version, environment, status, tags } = req.body;

  const exists = await Application.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error("An application with that name already exists");
  }

  const application = await Application.create({
    name,
    description,
    owner,
    version,
    environment,
    status,
    tags,
    createdBy: req.user._id,
  });

  res.status(201).json(application);
});

// @desc    Update an application
// @route   PUT /api/applications/:id
// @access  Private (Admin)
const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  const { name, description, owner, version, environment, status, tags } = req.body;

  application.name = name ?? application.name;
  application.description = description ?? application.description;
  application.owner = owner ?? application.owner;
  application.version = version ?? application.version;
  application.environment = environment ?? application.environment;
  application.status = status ?? application.status;
  application.tags = tags ?? application.tags;

  const updated = await application.save();
  res.status(200).json(updated);
});

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private (Admin)
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  await application.deleteOne();
  res.status(200).json({ message: "Application removed" });
});

export {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
};
