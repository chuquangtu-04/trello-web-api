import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
const createNew = async (req, res, next) => {
  try {
    const createCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createCard)
  } catch (error) {next(error)}
}

const updateCard = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const updateCard = await cardService.updateCard(cardId, req.body)
    res.status(StatusCodes.CREATED).json(updateCard)
  } catch (error) {next(error)}
}
export const cardController = { createNew, updateCard }