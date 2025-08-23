import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
// Điều hướng lên service và vào model tạo mới board mới vào databasw
const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng service
    const createdBoard = await boardService.createNew(req.body)
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {next(error)}
}
const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id
    // Sau này sẽ có thêm userId nữa để chỉ lấy board thuộc về user đó thôi 
    const board = await boardService.getDetails(boardId)
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(board)
  } catch (error) {next(error)}
}

export const boardController = { createNew, getDetails }