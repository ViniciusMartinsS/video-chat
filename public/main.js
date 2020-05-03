'use strict'

const Peer = require('simple-peer')
const socket = io()
const video = document.querySelector('video')
const client = {}
let STREAM = null

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then(stream => {
    socket.emit('newClient')
    video.srcObject = stream
    video.play()
    STREAM = stream

    socket.on('BackOffer', frontAnswer)
    socket.on('BackAnswer', signalAnswer)
    socket.on('SessionActive', sessionActive)
    socket.on('CreatePeer', makePeer)
  })
  .catch(err => document.write(err))

function initPeer (type, stream = STREAM) {
  const trickle = false
  const initiator = type === 'init'
    ? true
    : false

  const peer = new Peer({ initiator, stream, trickle })

  peer.on('stream', stream => createVideo(stream))
  peer.on('close', () => {
    document.getElementById('peerVideo').remove()
    peer.destroy()
  })

  return peer
}

function makePeer (stream = STREAM) {
  client.gotAnswer = false
  const peer = initPeer('init', stream)

  peer.on('signal', data => {
    if (!client.gotAnswer) {
      socket.emit('Offer', data)
    }
  })

  client.peer = peer
}

function frontAnswer (offer, stream = STREAM) {
  const peer = initPeer('notInit', stream)

  peer.on('signal', data => socket.emit('Answer', data))
  peer.signal(offer)
}

function signalAnswer (answer) {
  client.gotAnswer = true
  const peer = client.peer
  peer.signal(answer)
}

function createVideo (stream) {
  const video = document.createElement('video')
  video.id = 'peerVideo'
  video.srcObject = stream
  video.class = 'embed-responsive-item'
  document.querySelector('#peerDiv').appendChild(video)
}

function sessionActive () {
  document.write('Session active. Please, come back later!')
}
