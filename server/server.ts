import bodyParser from "body-parser"
import express from "express"
import { postAction } from "./routes/postAction"
import jwt from "jwt-simple"
import { Errors } from "../src/errors"
import { secret } from "./secret.json"

const app = express()
const port = process.env.PORT || 5000

const sessionCounter: { [key: string]: number } = {}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  if (req.body && req.body.sessionId) {
    if (req.body.sessionId in sessionCounter) next()
    else {
      if (Object.keys(sessionCounter).length > 20)
        res.status(500).send({
          message:
            "Session limit exceeded, please restart server or manually purge sessions",
          code: Errors.SessionLimitExceeded,
        })
      else {
        sessionCounter[req.body.sessionId] = 0
        next()
      }
    }
  } else {
    res.status(403).send({
      message: "You are missing the sessionId in the body",
      code: Errors.MissingSessionId,
    })
  }
})

app.use((req, res, next) => {
  if (req.body && req.body.request) {
    try {
      let payload = jwt.decode(req.body.request, secret, false, "HS256")
      if (payload.counter === sessionCounter[req.body.sessionId]) {
        sessionCounter[req.body.sessionId]++
        next()
      } else {
        res.status(403).send({
          message:
            "Sorry, you sent the wrong counter value, your current session counter is at " +
            sessionCounter[req.body.sessionId],
          code: Errors.InvalidCounterValue,
          counter: sessionCounter[req.body.sessionId],
        })
      }
    } catch (e) {
      res.status(403).send({
        message: "Could not verify the token.",
        code: Errors.FailedTokenVerify,
      })
    }
  } else {
    res.status(403).send({
      message:
        "You need to send a request in the body as a JWT verified with the agreed secret with HS256.",
      code: Errors.MissingRequestToken,
    })
  }
})

// messages
app.post("/api/action", postAction)

// tslint:disable-next-line:no-console
app.listen(port, () => console.log(`Listening on port ${port}`))
