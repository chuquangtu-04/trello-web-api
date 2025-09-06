/* eslint-disable no-console */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, OBJECT_ID_RULE_MESSAGE_MOVING_CARD } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    // Nếu cần làm tính năng chuyển column sang board khác thì mới thêm validate
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([])
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

// Validation ngoài column
const updateCardOutColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    activeCardId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({ 'string.pattern.base':  OBJECT_ID_RULE_MESSAGE_MOVING_CARD('activeCardId') }),
    activeColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({ 'string.pattern.base':  OBJECT_ID_RULE_MESSAGE_MOVING_CARD('activeColumnId') }),
    overColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({ 'string.pattern.base':  OBJECT_ID_RULE_MESSAGE_MOVING_CARD('overColumnId') } ),
    columnActiveOrderIds: Joi.object().required().messages({ 'string.pattern.base':  OBJECT_ID_RULE_MESSAGE_MOVING_CARD('columnActiveOrderIds') }),
    columnOverOrderIds: Joi.object().required().messages({ 'string.pattern.base':  OBJECT_ID_RULE_MESSAGE_MOVING_CARD('columnActiveOrderIds') })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

// Xóa mềm column
const softDeleteColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message({ 'string.pattern.base':  OBJECT_ID_RULE_MESSAGE_MOVING_CARD('columnId') })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const columnValidation = { createNew, updateColumn, updateCardOutColumn, softDeleteColumn }