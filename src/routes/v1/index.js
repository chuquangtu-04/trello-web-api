import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouter } from './boardRoute'
import { cardRouter } from './cardRouter'
import { columnRouter } from './columnRouter'
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

export const APIs_v1 = Router