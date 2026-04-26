import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddlewares'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMidlleware'
import { uploadController } from '~/controllers/uploadController'

const Router = express.Router()

Router.route('/')
  .post(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('image'),
    uploadController.uploadImage
  )

export const uploadRouter = Router
