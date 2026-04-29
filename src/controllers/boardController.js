import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

// Điều hướng lên service và vào model tạo mới board mới vào database
const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createdBoard = await boardService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}
const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const userId = req.jwtDecoded._id
    const board = await boardService.getDetails(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const getBoardDetailsSoftColumn = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const userId = req.jwtDecoded._id
    const board = await boardService.getBoardDetailsSoftColumn(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const board = await boardService.update(boardId, req.body)
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { page, itemsPerPage, q } = req.query
    const queryFilters = q
    const results = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)
    res.status(StatusCodes.OK).json(results)
  } catch (error) {
    next(error)
  }
}

// ============================================================
// Label controllers
// ============================================================

const createLabel = async (req, res, next) => {
  try {
    const boardId = req.params.boardId
    const result = await boardService.createLabel(boardId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const updateLabel = async (req, res, next) => {
  try {
    const { boardId, labelId } = req.params
    const result = await boardService.updateLabel(boardId, labelId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const deleteLabel = async (req, res, next) => {
  try {
    const boardId = req.params.boardId
    const labelId = req.params.labelId
    const result = await boardService.deleteLabel(boardId, labelId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getArchivedCards = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const result = await boardService.getArchivedCards(boardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const toggleStar = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const result = await boardService.toggleStar(userId, boardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const updateVisibility = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const result = await boardService.updateVisibility(userId, boardId, req.body.visibility)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  getBoardDetailsSoftColumn,
  getBoards,
  createLabel,
  updateLabel,
  deleteLabel,
  getArchivedCards,
  toggleStar,
  updateVisibility
}