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
  } catch (error) { throw error }
}

const updateCard = async (cardId, reqBody, cardCoverFile, userInfo) => {
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
    } else if (newCardData.newCommentToAdd) {
      // Tạo dữ liệu comment để thêm vào database, cần bổ sung thêm những file cần thiết
      const commentData = {
        ...newCardData.newCommentToAdd,
        userId: userInfo._id,
        userEmail: userInfo.email,
        commentedAt: Date.now()
      }
      updateCard = await cardModel.unShiftNewComment(cardId, commentData)
    } else if (newCardData.incomingMemberInfo) {
      // Trường hợp add or remove ra khỏi card
      updateCard = await cardModel.updateMembers(cardId, newCardData.incomingMemberInfo)
    } else if (newCardData.newAttachmentToAdd) {
      const attachmentData = {
        ...newCardData.newAttachmentToAdd,
        addedAt: Date.now()
      }
      updateCard = await cardModel.unshiftNewAttachment(cardId, attachmentData)
    } else if (newCardData.attachmentToDelete) {
      updateCard = await cardModel.pullAttachment(cardId, newCardData.attachmentToDelete.url)
    } else if (newCardData.toggleLabelId) {
      // Toggle label: add nếu chưa có, remove nếu đã có
      updateCard = await cardModel.toggleLabel(cardId, newCardData.toggleLabelId)
    } else {
      // Các trường hợp update chung như title, description
      updateCard = await cardModel.updateCard(cardId, newCardData)
    }
    return updateCard
  } catch (error) { throw error }
}
const deleteCard = async (cardId) => {
  try {
    await cardModel.hardDeleteById(cardId)
    // Cũng nên xóa cardId ra khỏi column.cardOrderIds, nhưng boardModel / columnModel sẽ cần xử lý
    // Ở đây ta cứ trả về success, Frontend sẽ xóa thẻ trong Redux
    return { message: 'Card deleted successfully' }
  } catch (error) { throw error }
}

const archiveCard = async (cardId) => {
  try {
    const updateData = {
      isArchived: true,
      archivedAt: Date.now(),
      updatedAt: Date.now()
    }
    const updatedCard = await cardModel.updateCard(cardId, updateData)
    return updatedCard
  } catch (error) { throw error }
}

export const cardService = { createNew, updateCard, deleteCard, archiveCard }