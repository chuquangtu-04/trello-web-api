/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import { pickUser } from '~/utils/formatter'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'


const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống của chúng ta chưa

    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!' )
    }
    // Tạo data để lưu vào Database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Giá trị thứ hai là độ phức tạp
      // giá trị càng cao băm càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail, // Mặc định để giống username khi user đăng kí mới, về sau làm tính
      // năng update cho user
      verifyToken: uuidv4()

    }
    // Thực hiện lưu thông tin vào database

    const createUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createUser.insertedId)

    // Gửi email cho người dùng xác thực

    // Return trả về dữ liệu cho controller
    return pickUser(getNewUser)
  } catch (error) { throw error}
}

export const userService = {
  createNew
}