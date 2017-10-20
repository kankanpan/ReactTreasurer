const express = require('express')
const app = express()
const server = require('http').createServer(app)
const portNo = 3000
server.listen(portNo, () => {
  console.log('起動しました', 'http://localhost:' + portNo)
})

const NeDB = require('nedb')
const db = {}
db.access = new NeDB({
  filename: 'accessLog'
})
db.access.loadDatabase()
db.message = new NeDB({
  filename: 'messageLog'
})
db.message.loadDatabase()

app.use('/public', express.static(__dirname + '/public'))
app.get('/', (req, res) => {
  res.redirect(302, '/public')
})
app.get('/api', (req, res) => {
  res.header('Content-Type', 'application/json; charset=utf-8')
  db.message.find({}, {message: 1}).sort({date: 1}).exec(function(err, docs){
    res.send(docs)
  })
})

const socketio = require('socket.io')
const io = socketio.listen(server)

io.on('connection', (socket) => {
  db.access.insert([
    { clientId: socket.client.id, date: Date.now()}
  ], function(err, docs){
    console.log('ユーザーが接続', socket.client.id)
  })
  socket.on('test-msg', (msg) => {
    db.message.insert([
      { clientId: socket.client.id, message: msg, date: Date.now()}
    ])
    io.emit('test-msg', msg)
  })
})
