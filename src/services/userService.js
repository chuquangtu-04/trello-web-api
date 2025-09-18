/* eslint-disable no-useless-catch */
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { pickUser } from '~/utils/formatter'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'


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
    const verifiCationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello MERN Stack Advanced: Please verify your email before using our service!'
    const htmlContent = `
    <h3>Here is your verification link:</h3>
    <h3>${verifiCationLink}</h3>
    <h3>Sincerely,<br/> - QuangTuDev – Một Lập Trình Viên – </h3>
    `

    // Gọi tới Provider gọi email
    BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // Return trả về dữ liệu cho controller
    return pickUser(getNewUser)
  } catch (error) { throw error}
}

const verifyAccount = async (reqBody) => {
  try {
  // Query user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account already active!')
    if (reqBody.token !== existUser.verifyToken ) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')


    // Nếu như mói thứ ok chúng ta sẽ update thông tin của thằng user để verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    // Thực hiện update thông tin user
    const updateUser = await userModel.update(existUser._id, updateData)

    // Trả về kết quả cho controller
    return pickUser(updateUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
  // Query user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect!')
    }

    // Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
    // Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = { _id: existUser._id, email: existUser.email }

    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5 // 5 giây
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login
}