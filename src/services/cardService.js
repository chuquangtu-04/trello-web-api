/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createCard.insertedId.toString())
    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {throw error}
}

const updateCard = async (cardId, reqBody, cardCoverFile) => {
  try {
    const newCardData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updateCard = {}
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'cardCover')
      updateCard = await cardModel.updateCard(cardId,
        {
          cover: uploadResult.secure_url,
          updatedAt: Date.now()
        })
    } else {
      // Các trường hợp update chung như title, description
      updateCard = await cardModel.updateCard(cardId, newCardData)
    }
    return updateCard
  } catch (error) {throw error}
}
export const cardService = { createNew, updateCard }