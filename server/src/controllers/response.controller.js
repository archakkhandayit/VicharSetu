import jwt from "jsonwebtoken";

import Poll from "../models/poll.model.js";
import Option from "../models/option.model.js";
import Response from "../models/response.model.js";
import User from "../models/user.model.js";

import verifyToken from '../utils/verifyToken.js'

export const submitResponse = async (req, res) => {
    try {
        const { pollId } = req.params;

        const { selectedOptionId } = req.body;

        const user = req.user || null;

        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found",
            });
        }

        // CHECK EXPIRY
        if (new Date() > poll.expiresAt) {
            return res.status(400).json({
                message: "Poll has expired",
            });
        }

        // AUTHENTICATED POLL CHECK
        if (poll.responseMode === "authenticated") {

            if (!user) {
                return res.status(401).json({
                    message:
                        "Login required to vote",
                });
            }
        }

        // VALIDATE OPTION
        const option = await Option.findOne({
            _id: selectedOptionId,
            pollId,
        });

        if (!option) {
            return res.status(400).json({
                message: "Invalid option selected",
            });
        }

        // PREVENT DUPLICATE VOTE

        if (user) {
            const alreadyResponded =
                await Response.findOne({
                    pollId,
                    userId: user._id,
                });

            if (alreadyResponded) {
                return res.status(400).json({
                    message:
                        "You already responded in this poll",
                });
            }
        }

        // CREATE RESPONSE
        await Response.create({
            pollId,
            userId: user ? user._id : null,
            selectedOptionId,
            isAnonymous: !user,
        });

        // INCREMENT TOTAL RESPONSES
        poll.totalResponses += 1;

        await poll.save();

        res.status(201).json({
            message: "Response submitted",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getPollAnalytics = async (req, res) => {
    try {
        const { pollId } = req.params;

        const poll = await Poll.findById(
            pollId
        );

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found",
            });
        }

        const analytics =
            await Response.aggregate([
                {
                    $match: {
                        pollId: poll._id,
                    },
                },

                {
                    $group: {
                        _id: "$selectedOptionId",
                        votes: {
                            $sum: 1,
                        },
                    },
                },
            ]);

        const options = await Option.find({
            pollId,
        });

        const formattedResults =
            options.map((option) => {
                const matched =
                    analytics.find(
                        (item) =>
                            item._id.toString() ===
                            option._id.toString()
                    );

                return {
                    optionId: option._id,
                    optionText: option.optionText,
                    votes: matched
                        ? matched.votes
                        : 0,
                };
            });

        res.status(200).json({
            poll,
            results: formattedResults,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};