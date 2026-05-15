import express from "express";

import {
    submitResponse,
    getPollAnalytics,
} from "../controllers/response.controller.js";

import { protect, getAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:pollId", getAuth, submitResponse);

router.get("/analytics/:pollId", protect, getPollAnalytics);

export default router;