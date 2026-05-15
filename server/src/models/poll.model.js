import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    responseMode: {
      type: String,
      enum: ["public", "authenticated"],
      default: "public",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publicLink: {
      type: String,
      unique: true,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    totalResponses: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;