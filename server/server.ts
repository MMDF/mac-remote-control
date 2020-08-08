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

// sessionId middleware
app.use((req, res, next) => {
  // sessionId is in the body?
  if (req.body && req.body.sessionId) {
    if (req.body.sessionId.length > 300)
      // we don't want overflow issues
      return res.status(403).send({
        message: "SessionId length is too long",
        code: Errors.SessionIdTooLong,
      })
    // if the sessionId is already being tracked
    if (req.body.sessionId in sessionCounter) next()
    else {
      if (Object.keys(sessionCounter).length > 20)
        // too many sessions, abort
        res.status(500).send({
          message:
            "Session limit exceeded, please restart server or manually purge sessions",
          code: Errors.SessionLimitExceeded,
        })
      // if not, start tracking with counter 0
      else {
        sessionCounter[req.body.sessionId] = 0
        next()
      }
    }
  } else {
    // cant do anything without a sessionId, sorry
    res.status(403).send({
      message: "You are missing the sessionId in the body",
      code: Errors.MissingSessionId,
    })
  }
})

app.use((req, res, next) => {
  if (req.body && req.body.request) {
    try {
      // verify JWT
      let payload = jwt.decode(req.body.request, secret, false, "HS256")
      if (payload.counter === sessionCounter[req.body.sessionId]) {
        // increment session counter and go on, everything is fine
        sessionCounter[req.body.sessionId]++
        next()
      } else {
        // the counter value is unsynchronized, or somebody is trying to forge requests, in any case reject
        res.status(403).send({
          message:
            "Sorry, you sent the wrong counter value, your current session counter is at " +
            sessionCounter[req.body.sessionId],
          code: Errors.InvalidCounterValue,
          counter: sessionCounter[req.body.sessionId],
        })
      }
    } catch (e) {
      // hmm, wrong token
      res.status(403).send({
        message: "Could not verify the token.",
        code: Errors.FailedTokenVerify,
      })
    }
  } else {
    // no request JWT was sent?
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
