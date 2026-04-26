import { StatusCodes } from 'http-status-codes'
import { uploadService } from '~/services/uploadService'

const uploadImage = async (req, res, next) => {
  try {
    const uploadResult = await uploadService.uploadImage(req.file)
    res.status(StatusCodes.OK).json(uploadResult)
  } catch (error) {
    next(error)
  }
}

export const uploadController = { uploadImage }
