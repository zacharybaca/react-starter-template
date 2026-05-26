import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

const userSchema = mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Customer Service",
        "Tech Support",
        "Human Resources",
        "Sales",
        "Marketing",
        "Engineering",
        "Product",
        "Finance",
        "Legal",
        "Operations",
        "Other",
      ],
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Employee", "Manager", "Admin"],
      default: "Employee",
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    avatar: { type: String },
    avatarPublicId: { type: String, default: "" },
    favoriteArticles: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
    ],
    isAdmin: { type: Boolean, default: false },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.getVerificationToken = function () {
  const token = crypto.randomBytes(20).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token;
};

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // 1. Generate a raw 20-character hex token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // 2. Hash the token and set it to the database field
  // We hash it in the DB so if your database is ever compromised, hackers can't use the tokens
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Set expiration to 10 minutes from right now
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // 4. Return the RAW token (this is what we email to the user)
  return resetToken;
};

/**
 * PRE-DELETE MIDDLEWARE
 * Triggers on user.deleteOne()
 * Handles Cloudinary asset removal, Review cascade deletion, and Pending Company cleanup.
 */
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const userId = this._id;

      // 1. Cleanup Cloudinary Image
      if (this.avatarPublicId) {
        await cloudinary.uploader.destroy(this.avatarPublicId);
        console.log(`✅ Cloudinary avatar removed: ${this.avatarPublicId}`);
      }

      next();
    } catch (error) {
      console.error("❌ Middleware Cleanup Error:", error);
      // We call next() anyway so the primary user record is still deleted
      next();
    }
  },
);

const User = mongoose.model("User", userSchema);

export default User;
