import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddlewares'
const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)

// Di chuyển Card ngoài column
Router.route('/moving_card')
  .put(authMiddleware.isAuthorized, columnValidation.updateCardOutColumn, columnController.updateCardOutColumn)

// Di chuyển card trong cùng 1 column
Router.route('/:id')
  .put(authMiddleware.isAuthorized, columnValidation.updateColumn, columnController.updateColumn)

// Xóa mềm column
Router.route('/soft-delete')
  .patch(authMiddleware.isAuthorized, columnValidation.softDeleteColumn, columnController.softDeleteColumn)

// Khôi phục column
Router.route('/restore-columns/:id')
  .patch(authMiddleware.isAuthorized, columnValidation.restoreColumns, columnController.restoreColumns)

// Xóa vĩnh viên column
Router.route('/hard-delete/:id')
  .delete(authMiddleware.isAuthorized, columnValidation.hardDeleteColumn, columnController.hardDeleteColumn)

// Copy column
Router.route('/copy/:id')
  .post(authMiddleware.isAuthorized, columnController.copyColumn)

export const columnRouter = Router