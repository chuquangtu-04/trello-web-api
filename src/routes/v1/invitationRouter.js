import express from 'express'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddlewares'
import { invitationValidation } from '~/validations/invitationValidation'
const Router = express.Router()

Router.route('/board')
  .post(
    authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation
  )
Router.route('/')
// lấy invitation theo user
  .get(
    authMiddleware.isAuthorized,
    invitationController.getInvitations
  )
Router.route('/board/:invitationId')
// lấy invitation theo user
  .put(
    authMiddleware.isAuthorized,
    invitationValidation.updateInvitations,
    invitationController.updateInvitations
  )

export const invitationRouter = Router