import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddlewares'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMidlleware'
const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)
Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.updateCard,
    cardController.updateCard)

Router.route('/:id/archive')
  .patch(authMiddleware.isAuthorized, cardController.archiveCard)

Router.route('/:id/move')
  .patch(authMiddleware.isAuthorized, cardValidation.moveCard, cardController.moveCard)

export const cardRouter = Router