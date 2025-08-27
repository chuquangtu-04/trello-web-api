/* eslint-disable no-useless-catch */
import { columnModel } from '~/models/columnModel'
const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createColumn.insertedId.toString())
    return getNewColumn
  } catch (error) {throw error}
}
export const columnService = { createNew }