import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";

import Poll from "../models/poll.model.js";
import Option from "../models/option.model.js";
import Response from "../models/response.model.js";
import User from "../models/user.model.js";

import verifyToken from '../utils/verifyToken.js'
import { getIO } from "../socket.js";

// Computes lean vote counts delta for real-time WebSocket broadcast (~80 bytes)
export const fetchPollVoteDelta = async (pollId, totalResponses) => {
    const analytics = await Response.aggregate([
        {
            $match: {
                pollId: new mongoose.Types.ObjectId(pollId),
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

    const votesMap = {};
    analytics.forEach((item) => {
        votesMap[item._id.toString()] = item.votes;
    });

    return {
        pollId,
        totalResponses,
        votes: votesMap,
    };
};

export const fetchPollAnalyticsData = async (pollId) => {
    const poll = await Poll.findById(pollId);
    if (!poll) return null;

    const analytics = await Response.aggregate([
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

    const formattedResults = options.map((option) => {
        const matched = analytics.find(
            (item) => item._id.toString() === option._id.toString()
        );

        return {
            optionId: option._id,
            optionText: option.optionText,
            votes: matched ? matched.votes : 0,
        };
    });

    return {
        poll,
        results: formattedResults,
    };
};

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
        let voterToken = null;

        if (user) {
            const alreadyResponded =
                await Response.findOne({
                    pollId,
                    userId: user._id,
                });

            if (alreadyResponded) {
                return res.status(400).json({
                    message: "You already responded in this poll",
                });
            }
        } else {
            // Anonymous voter protection: retrieve or issue HttpOnly anon_voter_id cookie
            voterToken = req.cookies?.anon_voter_id;

            if (!voterToken) {
                voterToken = crypto.randomUUID();
                const isProd = process.env.NODE_ENV === "production";
                res.cookie("anon_voter_id", voterToken, {
                    httpOnly: true,
                    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days (auto-purged by browser)
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    path: "/",
                });
            }

            const alreadyResponded = await Response.findOne({
                pollId,
                voterToken,
            });

            if (alreadyResponded) {
                return res.status(400).json({
                    message: "You have already voted in this poll",
                });
            }
        }

        // CREATE RESPONSE
        await Response.create({
            pollId,
            userId: user ? user._id : null,
            voterToken: user ? null : voterToken,
            selectedOptionId,
            isAnonymous: !user,
        });

        // INCREMENT TOTAL RESPONSES
        poll.totalResponses += 1;

        await poll.save();

        // EMIT LEAN DELTA VIA SOCKET.IO (only sends dynamic variable counts, ~80 bytes)
        try {
            const io = getIO();
            if (io) {
                const voteDelta = await fetchPollVoteDelta(pollId, poll.totalResponses);
                io.to(`poll_${pollId}`).emit("poll_analytics_updated", voteDelta);
            }
        } catch (socketErr) {
            console.error("Socket emit error:", socketErr);
        }

        res.status(201).json({
            message: "Response submitted",
        });
    } catch (error) {
        // Handle MongoDB E11000 duplicate key race condition gracefully
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already voted in this poll",
            });
        }
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getPollAnalytics = async (req, res) => {
    try {
        const { pollId } = req.params;

        const data = await fetchPollAnalyticsData(pollId);

        if (!data) {
            return res.status(404).json({
                message: "Poll not found",
            });
        }

        // IDOR Protection: Only the poll creator (or anyone if results are published) can view analytics
        if (
            data.poll.createdBy.toString() !== req.user._id.toString() &&
            !data.poll.isPublished
        ) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to view analytics for this poll",
            });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};