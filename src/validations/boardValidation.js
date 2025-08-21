/* eslint-disable no-console */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
// * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì
//      vì để cho Front-end tự validate và custom message phía FE cho đẹp.
// * Back-end chỉ cần validate Đảm Bảo Dữ Liệu Chuẩn Xác, và trả về message
//   mặc định từ thư viện là được.
// * Quan trọng: Việc Validate dữ liệu BẮT BUỘC phải có ở phía Back-end
//   vì đây là điểm cuối để lưu trữ dữ liệu vào Database.
// * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là
//   hãy luôn validate dữ liệu ở cả Back-end và Front-end nhé.
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().message({
      'any.required': 'Title is required (chuquangtu)',
      'string.empty': 'Title is not allowed to be empty (chuquangtu)',
      'string.min': 'Title length must be at least 3 characters long (chuquangtu)',
      'string.max': 'Title length must be less than or equal to 5 characters long (chuquangtu)',
      'string.trim': 'Title must not have leading or trailing whitespace (chuquangtu)'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })
  try {
    // Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const boardValidation = { createNew }