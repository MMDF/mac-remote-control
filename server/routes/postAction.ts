import { Response, Request } from "express"
import { exec } from "child_process"
import jwt from "jwt-simple"

export function postAction(req: Request, res: Response) {
  let result = false
  // assume request is verified
  const request = jwt.decode(req.body.request, "", true)
  const keycode = request.keycode
  if (keycode) {
    // parseInt makes it impossible to inject code here.
    exec(
      `osascript -l JavaScript -e "Application('System Events').keyCode(${parseInt(
        keycode
      )})"`
    )
    res.json({ message: "Your keycode has been sent" })
    result = true
    // debug
    console.log(req.body.keycode)
  }
  // to make sure a response is sent back
  if (!result) res.json({ message: "noop" })
}
