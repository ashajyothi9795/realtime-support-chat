import io from "socket.io-client"
import { useState, useRef, useEffect } from "react"

const socket = io("http://localhost:5000")

function App() {

  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [typingUser, setTypingUser] = useState("")
  const [onlineUsers, setOnlineUsers] = useState(0)

  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data])
    })

    socket.on("show_typing", (username) => {
      setTypingUser(username)

      setTimeout(() => {
        setTypingUser("")
      }, 1000)
    })

    socket.on("online_users", (count) => {
      setOnlineUsers(count)
    })

    return () => {
      socket.off("receive_message")
      socket.off("show_typing")
      socket.off("online_users")
    }

  }, [])

  const sendMessage = () => {

    if (message.trim() === "" || username.trim() === "") return

    const messageData = {
      username: username,
      text: message,
      time: new Date().toLocaleTimeString()
    }

    socket.emit("send_message", messageData)

    setMessage("")
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
        fontFamily: "Arial"
      }}
    >
      <div
        style={{
          width: "400px",
          height: "600px",
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          color: "white"
        }}
      >

        <h1 style={{ textAlign: "center" }}>
          Real-Time Chat
        </h1>

        <p style={{ textAlign: "center" }}>
          Online Users: {onlineUsers}
        </p>

        <input
          type="text"
          placeholder="Enter username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            marginBottom: "10px"
          }}
        />

        <div
          style={{
            flex: 1,
            backgroundColor: "#334155",
            borderRadius: "10px",
            padding: "10px",
            overflowY: "auto"
          }}
        >

          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                backgroundColor:
                  msg.username === username
                    ? "#3b82f6"
                    : "#475569",

                padding: "10px",
                borderRadius: "10px",
                marginBottom: "10px",

                marginLeft:
                  msg.username === username
                    ? "auto"
                    : "0",

                maxWidth: "80%"
              }}
            >

              <p
                style={{
                  margin: 0,
                  fontWeight: "bold"
                }}
              >
                {msg.username}
              </p>

              <p style={{ margin: "5px 0" }}>
                {msg.text}
              </p>

              <small>
                {msg.time}
              </small>

            </div>
          ))}

          <div ref={chatEndRef}></div>

        </div>

        <p
          style={{
            color: "lightgray",
            height: "20px",
            marginTop: "10px"
          }}
        >
          {typingUser && `${typingUser} is typing...`}
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px"
          }}
        >

          <input
            type="text"
            placeholder="Type message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              socket.emit("typing", username)
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none"
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              padding: "10px 15px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#3b82f6",
              color: "white",
              cursor: "pointer"
            }}
          >
            Send
          </button>

        </div>

      </div>
    </div>
  )
}

export default App