const express = require("express")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")

const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

let onlineUsers = 0

io.on("connection", (socket) => {

  onlineUsers++

  io.emit("online_users", onlineUsers)

  console.log("User connected:", socket.id)

  socket.on("send_message", (data) => {
    io.emit("receive_message", data)
  })

  socket.on("typing", (username) => {
    socket.broadcast.emit("show_typing", username)
  })

  socket.on("disconnect", () => {

    onlineUsers--

    io.emit("online_users", onlineUsers)

    console.log("User disconnected")
  })

})

app.get("/", (req, res) => {
  res.send("Backend is running 🚀")
})

const PORT = 5000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})