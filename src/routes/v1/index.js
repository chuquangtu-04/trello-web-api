import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouter } from './boardRoute'
import { cardRouter } from './cardRouter'
import { columnRouter } from './columnRouter'
import { userRouter } from './userRoute'
import { invitationRouter } from './invitationRouter'
const Router = express.Router()

// Check Api v1.status
Router.get('/status', (req, res ) => {
  res.status(StatusCodes.OK).json({ message: 'you access about', code: StatusCodes.OK })
})
// Board APIs
Router.use('/boards', boardRouter)
// Column APIs
Router.use('/columns', columnRouter)
// Card APIs
Router.use('/cards', cardRouter)
// Users APIs
Router.use('/users', userRouter)
// invitation APIs
Router.use('/invitations', invitationRouter)

export const APIs_v1 = Router