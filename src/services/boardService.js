/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { date } from 'joi'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    // Gọi tới tầng model để xử lý lưu bản ghi newBoard vào database
    const createBoard = await boardModel.createNew(newBoard)

    // Lấy bản ghi board sau khi gọi (tùy mục đích dự án mà có cần bước này không)
    const getNewBoard = await boardModel.findOneById(createBoard.insertedId.toString())

    // Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
    // Bắn email, Notification về cho admin khi có 1 board mới được tạo

    // Trả kết quả về, trong service luôn phải có return 
    return getNewBoard
  } catch (error) {throw error}
}
const getDetails = async (boardId) => {
  try {
    const resBoard = await boardModel.getDetails(boardId)
    if (!resBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board Not Found!')
    }
    // Deep clone board ra một cái bản sao mới để xử lý dữ liệu, không ảnh hưởng tới board ban đầu
    const boardClone = cloneDeep(resBoard)

    // Đưa Card về đúng Column của nó
    boardClone.columns.forEach(column => {
      // Cách dùng equals này là bởi vì chúng ta hiểu ObjectId trong mongodb có support method .equals
      column.cards = boardClone.cards.filter( card => card.columnId.equals(column._id))
      // Cách khác đơn giản hơn là convert ObjectId về String bằng hàm to String của js
      // column.cards = boardClone.cards.filter( card => card.columnId.toString() === column._id.toString())
    })

    //Xóa mảng Cards khỏi board ban đầu
    delete boardClone.cards
    return boardClone
  } catch (error) {throw error}
}

const update = async (boardId, reqBody) => {
  const newColumnData = {
    ...reqBody,
    updatedAt: Date.now()
  }
  try {
    const resUpdateColumn = boardModel.update(boardId, newColumnData)
    return resUpdateColumn
  } catch (error) {throw error }
}
export const boardService = { createNew, getDetails, update }