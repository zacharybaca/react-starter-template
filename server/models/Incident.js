import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const incidentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    severity: {
      type: String,
      enum: ["s1", "s2", "s3", "s4"],
      default: "s3",
    },
    // The client/company that reported the incident
    reportedBy: { type: String, required: true, trim: true },
    // Internal assignee (engineer/analyst)
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // The user who created the ticket internally
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tags: [{ type: String, trim: true }],
    resolution: { type: String, trim: true, default: "" },
    resolvedAt: { type: Date, default: null },
    comments: [commentSchema],
    // Estimated vs actual resolution time (minutes)
    estimatedResolutionTime: { type: Number, default: null },
  },
  { timestamps: true },
);

// Text index for full-text search on title and description
incidentSchema.index({ title: "text", description: "text" });

// Auto-set resolvedAt when status transitions to "resolved"
incidentSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

incidentSchema.plugin(mongoosePaginate);

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
