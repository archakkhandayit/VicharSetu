import express from "express";

import { getAuth, protect } from "../middlewares/auth.middleware.js";

import {
    createPoll,
    getPublicPoll,
    getMyPolls,
    publishPollResults,
    deletePoll
} from "../controllers/poll.controller.js";

const router = express.Router();

router.post("/", protect, createPoll);

router.get("/me", protect, getMyPolls);

router.get("/public/:publicLink", getAuth, getPublicPoll);

router.patch("/:pollId/publish", protect, publishPollResults);

router.delete("/:pollId", protect, deletePoll)

export default router;