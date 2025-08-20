import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouter } from './boardRoute'
const Router = express.Router()

// Check Api v1.status
Router.get('/status', (req, res ) => {
  res.status(StatusCodes.OK).json({ message: 'you access about', code: StatusCodes.OK })
})
// Board APIs
Router.use('/boards', boardRouter)

export const APIs_v1 = Router