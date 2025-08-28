/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel'
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
export const columnService = { createNew }