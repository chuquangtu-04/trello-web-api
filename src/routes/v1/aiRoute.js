import express from 'express'
import { aiController } from '~/controllers/aiController'
import { authMiddleware } from '~/middlewares/authMiddlewares'

const Router = express.Router()

// Route cho AI Chatbot - Yêu cầu đăng nhập
Router.route('/chat')
  .post(authMiddleware.isAuthorized, aiController.chat)

export const aiRouter = Router
