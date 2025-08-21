import { StatusCodes } from 'http-status-codes'

const createNew = (req, res, next) => {
  try {
    res.status(StatusCodes.CREATED).json({ message: 'POST from Controller: API create new board', code: StatusCodes.CREATED })
  } catch (error) {next(error)}
}

export const boardController = { createNew }