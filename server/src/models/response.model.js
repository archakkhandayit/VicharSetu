import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Anonymous voter token (issued via HttpOnly cookie)
    voterToken: {
      type: String,
      default: null,
      index: true,
    },

    selectedOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Option",
      required: true,
    },

    isAnonymous: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate votes at the database engine level (sparse ignores nulls)
responseSchema.index({ pollId: 1, userId: 1 }, { unique: true, sparse: true });
responseSchema.index({ pollId: 1, voterToken: 1 }, { unique: true, sparse: true });

const Response = mongoose.model("Response", responseSchema);

export default Response;
