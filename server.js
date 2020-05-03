'use strict'

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 3000

app.use(express.static(__dirname + '/public'))
let clients = 0

io.on('connection', function (socket) {
  socket.on('NewClient', () => {
    if (clients < 2 && clients === 1) {
      this.emit('CreatePeer')
      clients++
      return
    }

    this.emit('SessionActive')
  })

  socket.on('Offer', sendOffer)
  socket.on('Answer', sendAnswer)
  socket.on('Disconnect', disconnect)
})

function disconnect () {
  if (clients <= 0) {
    return
  }

  clients--
}

function sendOffer (Offer) {
  this.broadcast.emit('BackOffer', Offer)
}

function sendAnswer (data) {
  this.broadcast.emit('BackAnswer', data)
}

http.listen(port, () => console.log('Active on 3000'))
