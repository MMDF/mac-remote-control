import { Response, Request } from "express"
import { exec } from "child_process"
import jwt from "jwt-simple"

export function postAction(req: Request, res: Response) {
  let result = false
  const request = jwt.decode(req.body.request, "", true)
  const keycode = request.keycode
  if (keycode) {
    exec(
      `osascript -l JavaScript -e "Application('System Events').keyCode(${parseInt(
        keycode
      )})"`
    )
    res.json({ message: "Your keycode has been sent" })
    result = true
    console.log(req.body.keycode)
  }
  if (!result) res.json({ message: "noop" })
}
