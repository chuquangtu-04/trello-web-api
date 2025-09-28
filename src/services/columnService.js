/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
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
export const columnService = { createNew, updateColumn, updateCardOutColumn, softDeleteColumn, restoreColumns, hardDeleteColumn }