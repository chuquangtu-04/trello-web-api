import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'
const createNew = async (req, res, next) => {
  try {
    const createColumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createColumn)
  } catch (error) {next(error)}
}

const updateColumn = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const updateColumn = await columnService.updateColumn(columnId, req.body)
    res.status(StatusCodes.CREATED).json(updateColumn)
  } catch (error) {next(error)}
}
const updateCardOutColumn = async (req, res, next) => {
  try {
    const updateCardOutColumn = await columnService.updateCardOutColumn(req.body)
    res.status(StatusCodes.CREATED).json(updateCardOutColumn)
  } catch (error) {next(error)}
}


export const columnController = { createNew, updateColumn, updateCardOutColumn }