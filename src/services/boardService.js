/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'

const createNew = async (userId, reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    const createBoard = await boardModel.createNew(userId, newBoard)
    const getNewBoard = await boardModel.findOneById(createBoard.insertedId.toString())
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (userId, boardId) => {
  try {
    const resBoard = await boardModel.getDetails(userId, boardId)
    if (!resBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board Not Found!')
    }
    const boardClone = cloneDeep(resBoard)
    boardClone.columns.forEach(column => {
      column.cards = boardClone.cards.filter(card => card.columnId.equals(column._id))
    })
    delete boardClone.cards
    boardClone.columns = boardClone.columns.filter(column => column._destroy != true)
    return boardClone
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  try {
    const newColumnData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const resUpdateColumn = boardModel.update(boardId, newColumnData)
    return resUpdateColumn
  } catch (error) { throw error }
}

const getBoardDetailsSoftColumn = async (userId, boardId) => {
  try {
    const resBoard = await boardModel.getDetails(userId, boardId)
    if (!resBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board Not Found!')
    }
    const boardClone = cloneDeep(resBoard)
    boardClone.columns.forEach(column => {
      column.cards = boardClone.cards.filter(card => card.columnId.equals(column._id))
    })
    delete boardClone.cards
    // Xử lý lấy về nhưng column có _destroy = true là nhưng column được xóa mềm
    boardClone.columns = boardClone.columns.filter(column => column._destroy === true)
    console.log('🚀 ~ getBoardDetailsSoftColumn ~ boardClone:', boardClone)
    return boardClone
  }
  catch (error) { throw error }
}

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters
    )
    return results
  } catch (error) {
    throw error
  }
}

// ============================================================
// Label services
// ============================================================

const createLabel = async (boardId, reqBody) => {
  try {
    const { name, color } = reqBody
    // Không cho tạo label trùng tên + màu trong cùng board
    const board = await boardModel.findOneById(boardId)
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    const labels = board.labels || []
    const duplicate = labels.find(l => l.name === name && l.color === color)
    if (duplicate) throw new ApiError(StatusCodes.CONFLICT, 'Label with same name and color already exists!')
    const updatedBoard = await boardModel.createLabel(boardId, { name, color })
    // Trả về label vừa tạo (phần tử cuối mảng)
    const newLabel = updatedBoard.labels[updatedBoard.labels.length - 1]
    return { label: newLabel, labels: updatedBoard.labels }
  } catch (error) { throw error }
}

const updateLabel = async (boardId, labelId, reqBody) => {
  try {
    const updatedBoard = await boardModel.updateLabel(boardId, labelId, reqBody)
    if (!updatedBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board or Label not found!')
    return { labels: updatedBoard.labels }
  } catch (error) { throw error }
}

const deleteLabel = async (boardId, labelId) => {
  try {
    // Xóa label khỏi board
    await boardModel.deleteLabel(boardId, labelId)
    // Xóa labelId khỏi tất cả card trong board
    await cardModel.removeLabelFromAllCards(boardId, labelId)
    return { message: 'Label deleted successfully' }
  } catch (error) { throw error }
}

const getArchivedCards = async (boardId) => {
  try {
    const cards = await cardModel.getArchivedCards(boardId)
    return cards
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  getBoardDetailsSoftColumn,
  getBoards,
  createLabel,
  updateLabel,
  deleteLabel,
  getArchivedCards
}