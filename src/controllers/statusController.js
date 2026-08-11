import {
  createStatus as createStatusService,
  getStatuses as getStatusesService,
  getMyStatuses as getMyStatusesService,
  getStatus as getStatusService,
  viewStatus as viewStatusService,
  deleteStatus as deleteStatusService,
} from "../services/statusService.js";

import {
  successResponse,
} from "../utils/response.js";

// =====================================================
// CREATE STATUS
// =====================================================

export const createStatus = async (
  req,
  res,
  next
) => {
  try {
    const body =
      req.validatedData?.body ||
      req.body;

    const status =
      await createStatusService({
        userId: req.user._id,
        ...body,
      });

    return successResponse(
      res,
      201,
      "Status created successfully",
      {
        status,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET ALL AVAILABLE STATUSES
// =====================================================

export const getStatuses = async (
  req,
  res,
  next
) => {
  try {
    const statuses =
      await getStatusesService({
        userId: req.user._id,
      });

    return successResponse(
      res,
      200,
      "Statuses fetched successfully",
      {
        statuses,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET MY STATUSES
// =====================================================

export const getMyStatuses = async (
  req,
  res,
  next
) => {
  try {
    const statuses =
      await getMyStatusesService({
        userId: req.user._id,
      });

    return successResponse(
      res,
      200,
      "Your statuses fetched successfully",
      {
        statuses,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET SINGLE STATUS
// =====================================================

export const getStatus = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const status =
      await getStatusService({
        userId: req.user._id,
        statusId: params.statusId,
      });

    return successResponse(
      res,
      200,
      "Status fetched successfully",
      {
        status,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// VIEW STATUS
// =====================================================

export const viewStatus = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const status =
      await viewStatusService({
        userId: req.user._id,
        statusId: params.statusId,
      });

    return successResponse(
      res,
      200,
      "Status viewed successfully",
      {
        status,
      }
    );
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// DELETE STATUS
// =====================================================

export const deleteStatus = async (
  req,
  res,
  next
) => {
  try {
    const params =
      req.validatedData?.params ||
      req.params;

    const result =
      await deleteStatusService({
        userId: req.user._id,
        statusId: params.statusId,
      });

    return successResponse(
      res,
      200,
      "Status deleted successfully",
      result
    );
  } catch (error) {
    return next(error);
  }
};