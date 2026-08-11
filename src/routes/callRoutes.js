import express from "express";

import {
    createCall,
    getCall,
    getCallHistory,
    markCallRinging,
    joinCall,
    declineCall,
    leaveCall,  
    endCall,
    markCallMissed,
} from "../controllers/callController.js";

import {
    authMiddleware,
} from "../middleware/authMiddleware.js";

import {
    validate,
} from "../middleware/validationMiddleware.js";

import {
    createCallSchema,
    callIdSchema,
    callStatusSchema,
    endCallSchema,
    getCallHistorySchema,
} from "../schemas/callSchemas.js";

const router = express.Router();

// =====================================================
// ALL CALL ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authMiddleware);

// =====================================================
// CREATE CALL
// POST /call
// =====================================================

router.post(
    "/",
    validate(createCallSchema),
    createCall
);

// =====================================================
// CALL HISTORY
// GET /call/history
// =====================================================

router.get(
    "/history",
    validate(getCallHistorySchema),
    getCallHistory
);

// =====================================================
// GET SINGLE CALL
// GET /call/:callId
// =====================================================

router.get(
    "/:callId",
    validate(callIdSchema),
    getCall
);

// =====================================================
// MARK CALL RINGING
// PATCH /call/:callId/ringing
// =====================================================

router.patch(
    "/:callId/ringing",
    validate(callStatusSchema),
    markCallRinging
);

// =====================================================
// JOIN CALL
// PATCH /call/:callId/join
// =====================================================

router.patch(
    "/:callId/join",
    validate(callStatusSchema),
    joinCall
);

// =====================================================
// DECLINE CALL
// PATCH /call/:callId/decline
// =====================================================

router.patch(
    "/:callId/decline",
    validate(callStatusSchema),
    declineCall
);

// =====================================================
// MISSED CALL
// PATCH /call/:callId/missed
// =====================================================

router.patch(
  "/:callId/missed",
  validate(callStatusSchema),
  markCallMissed
);

// =====================================================
// LEAVE CALL
// PATCH /call/:callId/leave
// =====================================================

router.patch(
    "/:callId/leave",
    validate(callStatusSchema),
    leaveCall
);

// =====================================================
// END CALL
// PATCH /call/:callId/end
// =====================================================

router.patch(
    "/:callId/end",
    validate(endCallSchema),
    endCall
);

export default router;