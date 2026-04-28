/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { ObjectId } from 'mongodb'

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

const moveCard = async (cardId, reqBody) => {
  try {
    const { boardId, columnId, targetBoardId, targetColumnId, position } = reqBody

    const card = await cardModel.findOneById(cardId)
    if (!card) throw new Error('Card not found')

    const isDifferentBoard = targetBoardId && targetBoardId !== boardId

    if (columnId === targetColumnId && !isDifferentBoard) {
      // Di chuyển trong cùng một column
      const column = await columnModel.findOneById(columnId)
      if (!column) throw new Error('Column not found')

      const newCardOrderIds = Array.from(column.cardOrderIds.map(id => id.toString()))
      const oldIndex = newCardOrderIds.indexOf(cardId)
      if (oldIndex !== -1) {
        newCardOrderIds.splice(oldIndex, 1)
        newCardOrderIds.splice(position, 0, cardId)
        await columnModel.updateColumn(columnId, { cardOrderIds: newCardOrderIds })
      }
    } else {
      // Di chuyển sang column khác (có thể khác board)
      const oldColumn = await columnModel.findOneById(columnId)
      const newColumn = await columnModel.findOneById(targetColumnId)
      if (!oldColumn || !newColumn) throw new Error('Column(s) not found')

      // 1. Update card data
      const updateData = {
        columnId: ObjectId.createFromHexString(targetColumnId),
        updatedAt: Date.now()
      }
      if (isDifferentBoard) {
        updateData.boardId = ObjectId.createFromHexString(targetBoardId)
      }
      await cardModel.updateCard(cardId, updateData)

      // 2. Cập nhật cardOrderIds của column cũ
      const oldCardOrderIds = oldColumn.cardOrderIds.map(id => id.toString()).filter(id => id !== cardId)
      await columnModel.updateColumn(columnId, { cardOrderIds: oldCardOrderIds })

      // 3. Cập nhật cardOrderIds của column mới
      const newCardOrderIds = newColumn.cardOrderIds.map(id => id.toString())
      newCardOrderIds.splice(position, 0, cardId)
      await columnModel.updateColumn(targetColumnId, { cardOrderIds: newCardOrderIds })
    }

    return { message: 'Card moved successfully' }
  } catch (error) { throw error }
}

const copyCard = async (cardId, reqBody) => {
  try {
    const { title, columnId, position, options } = reqBody
    const originalCard = await cardModel.findOneById(cardId)
    if (!originalCard) throw new Error('Original card not found')

    // 1. Chuẩn bị dữ liệu cho card mới (Chuyển tất cả ObjectId về String để Joi validation không bị lỗi)
    const newCardData = {
      boardId: originalCard.boardId.toString(),
      columnId: columnId.toString(),
      title: title || `${originalCard.title} (copy)`,
      description: originalCard.description,
      cover: originalCard.cover,
      isArchived: false,
      archivedAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      _destroy: false
    }

    // 2. Copy các phần tùy chọn
    if (options.copyLabels) newCardData.labelIds = originalCard.labelIds || []
    if (options.copyMembers) {
      newCardData.memberIds = (originalCard.memberIds || []).map(id => id.toString())
    }
    if (options.copyDates) {
      newCardData.startDate = originalCard.startDate
      newCardData.dueDate = originalCard.dueDate
      newCardData.dueTime = originalCard.dueTime
      newCardData.reminder = originalCard.reminder
      newCardData.completed = originalCard.completed
    }
    if (options.copyAttachments) {
      newCardData.attachments = originalCard.attachments || []
    }

    // 3. Lưu card mới vào database
    const createdCardResult = await cardModel.createNew(newCardData)
    const newCard = await cardModel.findOneById(createdCardResult.insertedId.toString())

    // 4. Cập nhật cardOrderIds của column đích
    const targetColumn = await columnModel.findOneById(columnId)
    if (targetColumn) {
      const newCardOrderIds = targetColumn.cardOrderIds.map(id => id.toString())
      newCardOrderIds.splice(position, 0, newCard._id.toString())
      await columnModel.updateColumn(columnId, { cardOrderIds: newCardOrderIds })
    }

    return newCard
  } catch (error) { throw error }
}

export const cardService = { createNew, updateCard, deleteCard, archiveCard, moveCard, copyCard }