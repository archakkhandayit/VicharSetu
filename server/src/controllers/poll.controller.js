import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

import Poll from "../models/poll.model.js";
import Option from "../models/option.model.js";
import User from '../models/user.model.js';
import Response from '../models/response.model.js';

import isPollExpired from '../utils/isPollExpired.js'
import verifyToken from "../utils/verifyToken.js";

export const createPoll = async (req, res) => {
    try {
        const {
            title,
            description,
            questionText,
            options,
            responseMode,
            expiresAt,
            isAnonymousAllowed,
            requireAuthentication,
        } = req.body;

        if (!options || options.length < 2) {
            return res.status(400).json({
                message: "At least 2 options required",
            });
        }

        const poll = await Poll.create({
            title,
            description,
            questionText,
            createdBy: req.user._id,
            responseMode,
            expiresAt,
            isAnonymousAllowed,
            requireAuthentication,
            publicLink: nanoid(10),
        });

        const formattedOptions = options.map(
            (option) => ({
                pollId: poll._id,
                optionText: option,
            })
        );

        await Option.insertMany(formattedOptions);

        res.status(201).json({
            message: "Poll created successfully",
            poll,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getPublicPoll = async (req, res) => {
    try {
        const { publicLink } = req.params;

        const poll = await Poll.findOne({ publicLink });

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found",
            });
        }

        const user = req.user || null;

        // AUTH CHECK FIRST (safe)
        if (poll.responseMode === "authenticated" && !user) {
            return res.status(401).json({
                message: "Login required to access this poll",
            });
        }

        // IF RESULTS ARE PUBLISHED → IGNORE EXPIRY
        if (poll.isPublished) {
            const options = await Option.find({ pollId: poll._id });

            const analytics = await Response.aggregate([
                { $match: { pollId: poll._id } },
                {
                    $group: {
                        _id: "$selectedOptionId",
                        votes: { $sum: 1 },
                    },
                },
            ]);

            const results = options.map((option) => {
                const matched = analytics.find(
                    (item) => item._id.toString() === option._id.toString()
                );

                const votes = matched ? matched.votes : 0;

                const percentage =
                    poll.totalResponses > 0
                        ? ((votes / poll.totalResponses) * 100).toFixed(1)
                        : 0;

                return {
                    optionId: option._id,
                    optionText: option.optionText,
                    votes,
                    percentage,
                };
            });

            return res.status(200).json({
                type: "results",
                poll,
                totalResponses: poll.totalResponses,
                results,
            });
        }

        // ONLY NOW check expiry for ACTIVE poll view
        if (isPollExpired(poll.expiresAt)) {
            return res.status(400).json({
                message: "Poll has expired",
            });
        }

        // normal poll response
        const options = await Option.find({ pollId: poll._id });

        return res.status(200).json({
            type: "poll",
            poll,
            options,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getMyPolls = async (req, res) => {
    try {
        const polls = await Poll.find({
            createdBy: req.user._id,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({ polls });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const publishPollResults = async (req, res) => {
    try {
        const { pollId } = req.params;

        const user = req.user || null;

        const poll = await Poll.findById(
            pollId
        );

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found",
            });
        }

        if (poll.isPublished) {
            return res.status(200).json({
                message: "Poll results already published",
            })
        }

        // ONLY CREATOR CAN PUBLISH
        if (
            poll.createdBy.toString() !==
            user._id.toString()
        ) {
            return res.status(403).json({
                message: "Unauthorized",
            });
        }

        poll.isPublished = true;

        await poll.save();

        res.status(200).json({
            message:
                "Poll results published successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const deletePoll = async (req, res) => {
    try {
        const { pollId } = req.params;

        // Find poll
        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found",
            });
        }

        // Optional: Only creator can delete
        if (poll.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized to delete this poll",
            });
        }

        // Delete all related options
        await Option.deleteMany({ pollId });

        // Delete poll
        await Poll.findByIdAndDelete(pollId);

        res.status(200).json({
            message: "Poll deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};