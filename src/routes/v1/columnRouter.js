import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'
const Router = express.Router()

Router.route('/')
  .post(columnValidation.createNew, columnController.createNew)

// Di chuyển Card ngoài column
Router.route('/moving_card')
  .put(columnValidation.updateCardOutColumn, columnController.updateCardOutColumn)

// Di chuyển card trong cùng 1 column
Router.route('/:id')
  .put(columnValidation.updateColumn, columnController.updateColumn)

export const columnRouter = Router