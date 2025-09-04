/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
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

const updateColumn = async (columnId, reqBody) => {
  try {
    const newColumnData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updateColumn = await columnModel.updateColumn(columnId, newColumnData)
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
    await cardModel.updateCard(overColumnId, activeCardId)
  } catch (error) {throw error}
}
export const columnService = { createNew, updateColumn, updateCardOutColumn }