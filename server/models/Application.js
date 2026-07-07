import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true, default: "" },
    owner: { type: String, trim: true, default: "" },
    version: { type: String, trim: true, default: "" },
    environment: {
      type: String,
      enum: ["development", "staging", "production", "all"],
      default: "production",
    },
    status: {
      type: String,
      enum: ["active", "deprecated", "maintenance"],
      default: "active",
    },
    tags: [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
