/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createColumn.insertedId.toString())
    // Xử lý cấu trúc data ở đây trước khi trả về kết quả
    if (getNewColumn) {
      getNewColumn.cards = []
    }
    // Cập nhật mảng columnOrderIds trong collection boards
    await boardModel.pushColumnOrderIds(getNewColumn)
    return getNewColumn
  } catch (error) {throw error}
}

const updateColumn = async (columnId, reqBody, fieldName) => {
  try {
    const newColumnData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updateColumn = await columnModel.updateColumn(columnId, newColumnData, fieldName )
    return updateColumn
  } catch (error) {throw error}
}

const updateCardOutColumn = async (reqBody) => {
  try {
    const activeColumnId = reqBody.activeColumnId
    const overColumnId = reqBody.overColumnId
    const activeCardId = reqBody.activeCardId

    const newUpdateActiveColumn = {
      ...reqBody.columnActiveOrderIds,
      updatedAt: Date.now()
    }
    const newUpdateOverColumn = {
      ...reqBody.columnOverOrderIds,
      updatedAt: Date.now()
    }

    await columnModel.updateCardOutColumn(
      activeColumnId,
      overColumnId,
      newUpdateActiveColumn,
      newUpdateOverColumn)
    await cardModel.updateCardOutColumn(overColumnId, activeCardId)
  } catch (error) {throw error}
}

// Xóa mềm column
const softDeleteColumn = async (reqBody) => {
  try {
    const softColumnData = {
      _destroy: true,
      updatedAt: Date.now()
    }
    await columnModel.softDeleteColumn(reqBody.columnId, softColumnData)
    return { 'message' : 'Column and tag were successfully deleted' }
  } catch (error) {throw error}
}

// Khôi phục column
const restoreColumns = async (columnId, reqBody) => {
  try {
    const restoreColumns = {
      ...reqBody,
      updatedAt: Date.now()
    }
    await columnModel.restoreColumns(columnId, restoreColumns)
    return { 'message' : 'You have successfully restored!' }
  } catch (error) {throw error}
}

// Xóa vĩnh viễn column
const hardDeleteColumn = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board Not Found!')
    }
    // Loại bỏ columnId trong ColumnOrderIds sao khi đã bị xóa vĩnh viễn
    await boardModel.pullColumnOrderIds(targetColumn)

    // Xóa vĩnh viễn colun
    await columnModel.hardDeleteColumn(columnId)

    // Xóa vĩnh viễn card
    await cardModel.hardDeleteCard(columnId)
    return { 'message' : 'You have successfully deleted!' }
  } catch (error) {throw error}
}

// Sao chép column
const copyColumn = async (columnId, reqBody) => {
  try {
    const { newTitle } = reqBody
    const oldColumn = await columnModel.findOneById(columnId)
    if (!oldColumn) throw new ApiError(StatusCodes.NOT_FOUND, 'Column Not Found!')

    // 1. Tạo column mới bằng service hiện tại
    const newColumnData = {
      boardId: oldColumn.boardId.toString(),
      title: newTitle
    }
    const getNewColumn = await createNew(newColumnData)
    const newColumnId = getNewColumn._id.toString()
    
    // 2. Fetch cards
    const oldCards = await cardModel.findByColumnId(columnId)

    if (oldCards && oldCards.length > 0) {
      // 3. Duplicate cards
      const newCards = oldCards.map(card => {
        const newCardId = new ObjectId()
        return {
          ...card,
          _id: newCardId,
          columnId: ObjectId.createFromHexString(newColumnId),
          comments: [], // Không copy comment
          reminder: null, // Reset reminder
          createdAt: Date.now(),
          updatedAt: null
        }
      })
      
      // Đảm bảo thứ tự giống column cũ
      const orderedNewCards = oldColumn.cardOrderIds.map(oldId => {
        const index = oldCards.findIndex(c => c._id.toString() === oldId.toString())
        return newCards[index]
      }).filter(c => c)

      if (orderedNewCards.length > 0) {
        await cardModel.insertMany(orderedNewCards)
        // Cập nhật cardOrderIds cho column mới
        const newCardOrderIds = orderedNewCards.map(c => c._id.toString())
        await columnModel.updateColumn(newColumnId, { cardOrderIds: newCardOrderIds }, 'cardOrderIds')
        
        getNewColumn.cards = orderedNewCards
        getNewColumn.cardOrderIds = newCardOrderIds
      }
    }

    return getNewColumn
  } catch (error) { throw error }
}

export const columnService = { createNew, updateColumn, updateCardOutColumn, softDeleteColumn, restoreColumns, hardDeleteColumn, copyColumn }