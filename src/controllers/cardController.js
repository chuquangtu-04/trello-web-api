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
    const userInfo = req.jwtDecoded
    const cardCoverFile = req.file
    const updateCard = await cardService.updateCard(cardId, req.body, cardCoverFile, userInfo)
    res.status(StatusCodes.CREATED).json(updateCard)
  } catch (error) {next(error)}
}
const deleteCard = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const result = await cardService.deleteCard(cardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const archiveCard = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const result = await cardService.archiveCard(cardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const cardController = { createNew, updateCard, deleteCard, archiveCard }