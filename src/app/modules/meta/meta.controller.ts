import { Request, Response } from "express";

import httpStatus from "http-status";
import { MetaService } from "./meta.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const getAdminDashboardMeta = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MetaService.getAdminDashboardMeta();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: result,
    });
  }
);

export const MetaController = {
  getAdminDashboardMeta,
};
