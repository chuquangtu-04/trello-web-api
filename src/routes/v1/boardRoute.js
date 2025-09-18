import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddlewares'
const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'GET: API get list boards', code: StatusCodes.OK })
  })
  // Lần lượt chạy boardValidation.createNew khi nó chạy, validation xong nó next thì chạy tiếp boardController.createNew
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

// Gọi APi trả về nhưng column xóa mềm
Router.route('/boards-soft-column/:id')
  .get(authMiddleware.isAuthorized, boardController.getBoardDetailsSoftColumn)

export const boardRouter = Router