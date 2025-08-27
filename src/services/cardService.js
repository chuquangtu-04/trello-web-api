/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel'
const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createCard.insertedId.toString())
    return getNewCard
  } catch (error) {throw error}
}
export const cardService = { createNew }