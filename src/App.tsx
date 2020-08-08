import "./App.css"

import React, { useRef, useState } from "react"
import createPersistedState from "use-persisted-state"
import jwt from "jwt-simple"
import { makeid } from "./util"
import { Errors } from "./errors"

// import logo from "./logo.svg"
const useSecretState = createPersistedState("secret")
const useSessionState = createPersistedState("sessionId")
const useSessionCounterState = createPersistedState("sessionCounter")

// so we don't generate new ids unnecessarily in every render
const randomid = makeid(10)
const increment = (x: number) => x + 1

function App() {
  const [secret, setSecret] = useSecretState<string>("")
  const [session] = useSessionState<string>(randomid)
  const [sessionCounter, setSessionCounter] = useSessionCounterState<number>(0)
  const [touch, setTouch] = useState<boolean>(false)

  const inputRef = useRef<HTMLInputElement>()
  const keyCode = (code: number, fromTouch: boolean) => {
    if (fromTouch) setTouch(true)
    if (!fromTouch && touch) return
    fetch("/api/action", {
      method: "POST",
      body: JSON.stringify({
        request: jwt.encode(
          { counter: sessionCounter, keycode: code },
          secret,
          "HS256"
        ),
        sessionId: session,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status === 200) setSessionCounter(increment)
        if (!response.ok) {
          console.log(response)
          return response.json()
        }
      })
      .then((jsonErrorMessage: any) => {
        console.log(jsonErrorMessage)
        if (!jsonErrorMessage) return
        if (jsonErrorMessage?.code === Errors.InvalidCounterValue) {
          setSessionCounter(jsonErrorMessage.counter)
        }
      })
  }
  return (
    <div className="App">
      <header className="App-header">
        <div className="secret">
          <input
            style={{ display: secret === "" ? "flex" : "none" }}
            type="text"
            ref={inputRef as any}
          ></input>
          <button
            style={{ display: secret === "" ? "flex" : "none" }}
            onClick={() =>
              inputRef.current?.value && setSecret(inputRef.current.value)
            }
          >
            Save secret
          </button>
          <button
            style={{ display: secret !== "" ? "flex" : "none" }}
            onClick={() => setSecret("")}
          >
            Change secret
          </button>
        </div>
        <div className="control">
          <button
            onMouseDown={keyCode.bind(null, 123, false)}
            onTouchStart={keyCode.bind(null, 123, true)}
          >
            Left Key
          </button>
          <button
            onMouseDown={keyCode.bind(null, 124, false)}
            onTouchStart={keyCode.bind(null, 124, true)}
          >
            Right Key
          </button>
        </div>
      </header>
    </div>
  )
}

export default App
