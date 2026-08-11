import {
  createCall as createCallService,
  getCall as getCallService,
  getCallHistory as getCallHistoryService,
  markCallRinging as markCallRingingService,
  joinCall as joinCallService,
  declineCall as declineCallService,
  leaveCall as leaveCallService,
  endCall as endCallService,
  markCallMissed as markCallMissedService,
} from "../services/callService.js";

import {
  successResponse,
} from "../utils/response.js";

// =====================================================
// CREATE CALL
// =====================================================

export const createCall = async (
  req,
  res,
  next
) => {
  try {
    const data =
      req.validatedData?.body ||
      req.body;

    const call =
      await createCallService({
        userId: req.user._id,
        type: data.type,
        mode: data.mode,
        chatId: data.chatId,
        participantIds:
          data.participantIds,
      });

    return successResponse(
      res,
      201,
      "Call created successfully",
      {
        call,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET SINGLE CALL
// =====================================================

export const getCall = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const call =
      await getCallService({
        userId: req.user._id,
        callId: params.callId,
      });

    return successResponse(
      res,
      200,
      "Call fetched successfully",
      {
        call,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET CALL HISTORY
// =====================================================

export const getCallHistory = async (
  req,
  res,
  next
) => {
  try {
    const query =
      req.validatedData?.query ||
      req.query;

    const result =
      await getCallHistoryService({
        userId: req.user._id,
        page: query.page,
        limit: query.limit,
      });

    return successResponse(
      res,
      200,
      "Call history fetched successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// MARK RINGING
// =====================================================

export const markCallRinging = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const call =
      await markCallRingingService({
        userId: req.user._id,
        callId: params.callId,
      });

    return successResponse(
      res,
      200,
      "Call is ringing",
      {
        call,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// JOIN CALL
// =====================================================

export const joinCall = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const call =
      await joinCallService({
        userId: req.user._id,
        callId: params.callId,
      });

    return successResponse(
      res,
      200,
      "Joined call successfully",
      {
        call,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// DECLINE CALL
// =====================================================

export const declineCall = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const call =
      await declineCallService({
        userId: req.user._id,
        callId: params.callId,
      });

    return successResponse(
      res,
      200,
      "Call declined successfully",
      {
        call,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// LEAVE CALL
// =====================================================

export const leaveCall = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const call =
      await leaveCallService({
        userId: req.user._id,
        callId: params.callId,
      });

    return successResponse(
      res,
      200,
      "Left call successfully",
      {
        call,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// MARK CALL MISSED
// =====================================================

export const markCallMissed = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const call =
      await markCallMissedService({
        userId: req.user._id,
        callId: params.callId,
      });

    return successResponse(
      res,
      200,
      "Call marked as missed successfully",
      {
        call,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// END CALL
// =====================================================

export const endCall = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const body =
      req.validatedData?.body ||
      req.body ||
      {};

    const call =
      await endCallService({
        userId: req.user._id,
        callId: params.callId,
        reason:
          body.reason || "completed",
      });

    return successResponse(
      res,
      200,
      "Call ended successfully",
      {
        call,
      }
    );
  } catch (error) {
    return next(error);  
  }
};