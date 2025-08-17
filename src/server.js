// const express = require('express')
import express from 'express'

const app = express()
const port = 8025
const hostname = 'localhost'

const middleware = (req, res) => {
  res.send('<h2>Hello World</h2>')
}

app.get('/', middleware)

app.listen(port, hostname, () => {
   console.log(`I'm running server at http://${hostname}:${port}`)
})