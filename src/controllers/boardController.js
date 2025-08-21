import { StatusCodes } from 'http-status-codes'

const createNew = (req, res) => {
  try {
    console.log('req.body: ', req.body)
    res.status(StatusCodes.CREATED).json({ message: 'POST from Controller: API create new board', code: StatusCodes.CREATED })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: error.message
    })
  }
}

export const boardController = { createNew }