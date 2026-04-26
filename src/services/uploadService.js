import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const uploadImage = async (imageFile) => {
  if (!imageFile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Image file is required.')
  }

  try {
    const uploadResult = await CloudinaryProvider.streamUpload(imageFile.buffer, 'boards')
    return { url: uploadResult.secure_url }
  } catch (error) {
    const cloudinaryMessage = error?.message || 'Cloudinary upload failed.'
    if (cloudinaryMessage.includes('cloud_name is disabled')) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        'Cloudinary cloud name is disabled. Please check CLOUDINARY_CLOUD_NAME and Cloudinary account status.'
      )
    }
    throw new ApiError(StatusCodes.BAD_GATEWAY, cloudinaryMessage)
  }
}

export const uploadService = { uploadImage }
