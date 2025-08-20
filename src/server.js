/* eslint-disable no-console */
import exitHook from 'exit-hook'
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from './config/environment'

const START_SERVER = () => {
  const app = express()

  app.get('/', async (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR} I am running at ${ env.APP_HOST }:${ env.APP_PORT }`)
  })

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