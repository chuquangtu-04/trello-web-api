/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'

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
    const getNewBoard = await boardModel.findOneById(createBoard.insertedId)

    // Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
    // Bắn email, Notification về cho admin khi có 1 board mới được tạo

    // Trả kết quả về, trong service luôn phải có return 
    return getNewBoard
  } catch (error) {throw error}
}
export const boardService = { createNew }