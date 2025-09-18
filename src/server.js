/* eslint-disable no-console */
import exitHook from 'exit-hook'
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from './config/environment'
import { APIs_v1 } from './routes/v1'
import { corsOptions } from './config/cors'
import cors from 'cors'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
const START_SERVER = () => {
  const app = express()

  // Fix cái vụ Cache from disk của ExpressJs
  // https://stackoverflow.com/questions/22632593/how-to-disable-webpage-caching-in-expressjs-nodejs/53240717#53240717
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Cấu hình cookieParser
  app.use(cookieParser())

  // Enable req.body json data
  app.use(express.json())
  app.use(cors(corsOptions))
  // Use Api v1
  app.use('/v1', APIs_v1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Môi trường Production (cụ thể hiện tại là đang support Render.com)
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`Hello ${env.AUTHOR} I am running at ${ process.env.PORT } on Production`)
    })
  } else {
    // Môi trường localhost
    app.listen(env.LOCAL_DEV_APP_PORT, env.APP_HOST, () => {
      console.log(`Hello ${env.AUTHOR} I am running at ${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT } on Local Dev`)
    })
  }


  // Thực hiện các tác vụ cleanup trước khi dừng server
  // Đọc thêm ở đây: https://stackoverflow.com/q/14031763/8324172
  exitHook(() => {
    CLOSE_DB()
  })
}

// Chỉ khi kết nối database thành công chúng ta mới Start server Back end lên
CONNECT_DB()
  .then(() => console.log('Connected  to mongoDB atlas!'))
  .then(() => START_SERVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })