import { userService } from '~/services/userService'
import { StatusCodes } from 'http-status-codes'
const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {next(error)}
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {next(error)}
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    // Xử lý trả về http only cookie phía trình duyệt
    // console.log(result)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {next(error)}
}
export const userController = { createNew, verifyAccount, login }