// All Required Modules & Packages ========================================
const path = require('path')
require(path.join(__dirname, '/database/connection.js'))
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const { ExpressPeerServer } = require('peer')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const cookieParser = require('cookie-parser')
const peerServer = ExpressPeerServer(server, {
  debug: true,
})
// Port Number & Listen ===================================================
const port = process.env.PORT || 80
server.listen(port)

// All Universal Middleware ===============================================
app.use(express.static(path.join(__dirname, 'static')))
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', 'layouts/base_format.ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())
app.use('/peerJS', peerServer)

// Routes Middleware ======================================================
app.get('/', (req, res) => res.redirect('/home'))
app.use('/home', require('./routes/home'))
app.use('/room', require('./routes/room'))
app.use('/profile', require('./routes/profile'))
app.use('/features', require('./routes/features'))
app.use('/appearance', require('./routes/appearance'))
app.use('/developer', require('./routes/developer'))
app.use('/signup', require('./routes/signup'))
app.use('/login', require('./routes/login'))
app.use('/forget_password', require('./routes/forget_password'))
app.use('/logout', require('./routes/logout'))
app.use('/verify_otp', require('./routes/verify_otp'))
app.use('/*', require('./routes/notFound'))

// All Socket Events ======================================================
let allUsersGlobally = []
io.on('connection', socket => {
  socket.on(
    'new-user-joined-ingoing',
    (roomID, newParticipantName, socketID, peerID) => {
      let oneRoom = allUsersGlobally.find(
        oneRoom => oneRoom.roomID === roomID
      )
      if (oneRoom === undefined) {
        oneRoom = {
          roomID,
          hostId: socketID,
          participantSocketID: [],
          tempParticipantSocket: [],
        }
        allUsersGlobally.push(oneRoom)
        oneRoom.participantSocketID.push(socketID)
        socket.join(roomID)
      } else {
        oneRoom.tempParticipantSocket.push(socket)
        setTimeout(() => {
          socket
            .to(oneRoom.hostId)
            .emit(
              'joining-permission-requested',
              newParticipantName,
              socketID,
              peerID
            )
        }, 1000)
      }
      socket.on(
        'join-permission-response',
        (response, newParticipantName, socketID, peerID) => {
          if (socket.id === oneRoom.hostId) {
            const tempSocketObj =
              oneRoom.tempParticipantSocket.shift()
            if (response && tempSocketObj.connected) {
              tempSocketObj.join(oneRoom.roomID)
              oneRoom.participantSocketID.push(socketID)
              io.in(roomID).emit(
                'new-user-joined-outgoing',
                newParticipantName,
                socketID,
                peerID
              )
            } else {
              socket.to(socketID).emit('permission-denied')
            }
          }
        }
      )
      socket.on(
        'send-my-details-to-new-user',
        (
          oldParticipantName,
          oldParticipantSocketID,
          oldParticipantPeerID,
          socketID
        ) => {
          if (oneRoom.participantSocketID.includes(socket.id)) {
            socket
              .to(socketID)
              .emit(
                'receiving-old-participant-details',
                oldParticipantName,
                oldParticipantSocketID,
                oldParticipantPeerID
              )
          }
        }
      )
      socket.on('media-update-ingoing', (mediaType, peerID) => {
        if (oneRoom.participantSocketID.includes(socket.id)) {
          socket
            .to(roomID)
            .emit('media-update-outgoing', mediaType, peerID)
        }
      })
      socket.on('sending-message', (chatMessage, time) => {
        if (oneRoom.participantSocketID.includes(socket.id)) {
          socket
            .to(roomID)
            .emit('receiving-message', chatMessage, time)
        }
      })
      socket.on('disconnect', () => {
        if (socket.id === oneRoom.hostId) {
          allUsersGlobally.splice(
            allUsersGlobally.indexOf(oneRoom),
            1
          )
          socket.to(roomID).emit('host-left')
          io.in(roomID).disconnectSockets()
        } else if (oneRoom.participantSocketID.includes(socket.id)) {
          oneRoom.participantSocketID.splice(
            oneRoom.participantSocketID.indexOf(socket.id),
            1
          )
          socket
            .to(roomID)
            .emit('participant-disconnected', socket.id)
        }
      })
    }
  )
})
