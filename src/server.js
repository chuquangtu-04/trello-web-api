/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, GET_DB } from '~/config/mongodb'

const START_SERVER = () => {
  const app = express()

  const hostname = 'localhost'
  const port = 8017

  app.get('/', async (req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    console.log(`I am running at ${ hostname }:${ port }/`)
  })
}

// // Immediately-invoked / Anonymous Async Functions (IIFE)
// ( async () => {
//   try {
//     await CONNECT_DB()
//     START_SERVER()
//   } catch (error) {
//     console.error(error)
//     process.exit(0)
//   }
// })()

// Chỉ khi kết nối database thành công chúng ta mới Start server Back end lên
CONNECT_DB()
  .then(() => console.log('Connected  to mongoDB atlas!'))
  .then(() => START_SERVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })