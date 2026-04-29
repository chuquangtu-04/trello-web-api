import { StatusCodes } from 'http-status-codes'
import { aiService } from '~/services/aiService'

const chat = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { boardId, message } = req.body

    const response = await aiService.chat(userId, boardId, message)
    
    res.status(StatusCodes.OK).json({ response })
  } catch (error) { next(error) }
}

export const aiController = { chat }
