import express from 'express'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddlewares'
import { boardValidation } from '~/validations/boardValidation'
const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  // Lần lượt chạy boardValidation.createNew khi nó chạy, validation xong nó next thì chạy tiếp boardController.createNew
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

// Gọi APi trả về nhưng column xóa mềm
Router.route('/boards-soft-column/:id')
  .get(authMiddleware.isAuthorized, boardController.getBoardDetailsSoftColumn)

// Label APIs
Router.route('/:boardId/labels')
  .post(authMiddleware.isAuthorized, boardController.createLabel)

Router.route('/:boardId/labels/:labelId')
  .put(authMiddleware.isAuthorized, boardController.updateLabel)
  .delete(authMiddleware.isAuthorized, boardController.deleteLabel)

export const boardRouter = Router