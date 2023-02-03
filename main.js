import * as dotenv from 'dotenv'
import { WebSocket } from "ws"
import { writeFileSync } from "fs"

dotenv.config()

const REQUIRED_ENV_VARS = [
  "REPLIKA_CHAT_ID",
  // "REPLIKA_TOKEN",
  "REPLIKA_USER_ID",
  "REPLIKA_AUTH_TOKEN",
  "REPLIKA_DEVICE_ID",
]

REQUIRED_ENV_VARS.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`)
  }
})

const ws = new WebSocket("wss://ws.replika.com/v17")

const query = {
  event_name: "history",
  payload: {
    chat_id: process.env.REPLIKA_CHAT_ID,
    limit: 100,
  },
  // token: process.env.REPLIKA_TOKEN,
  token: process.env.REPLIKA_AUTH_TOKEN,
  auth: {
    user_id: process.env.REPLIKA_USER_ID,
    auth_token: process.env.REPLIKA_AUTH_TOKEN,
    device_id: process.env.REPLIKA_DEVICE_ID,
  },
}

let messages = []

ws.on("open", () => {
  ws.send(JSON.stringify(query))

  ws.on("message", (data) => {
    const json = JSON.parse(data.toString())

    if (!json.payload || !json.payload.messages) {
      console.error("Unexpected message", json)
      process.exit(1)
    }

    const newMessages = json.payload.messages

    if (newMessages.length > 0) {
      messages = [...newMessages, ...messages]
      console.log(
        `${newMessages.length} new messages, total: ${messages.length}`
      )
      const newQuery = {
        ...query,
        payload: {
          ...query.payload,
          last_message_id: newMessages[0].id,
        },
      }
      ws.send(JSON.stringify(newQuery))
    } else {
      writeFileSync("messages.json", JSON.stringify(messages, null, 2))
      ws.close()
    }
  })
})
