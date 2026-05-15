import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

const Response = mongoose.model(
  "Response",
  responseSchema
);

export default Response;