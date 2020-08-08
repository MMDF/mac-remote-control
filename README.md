# Mac Remote Control

This is a nodejs remote control server that uses JWT for secure communication. It uses osascript to emit keycode events. You will have to enable Accessibility and System Events permissions for the application that you're running this server from (Terminal, iTerm, your code editor etc.).

## About

Currently only right/left arrow keys are available for control.

## Commands

`yarn start` - concurrently starts the dev servers, express and react
`yarn start-server` - starts dev express server
`yarn start-react` - starts dev react server

# CAUTION!!!

This project is just a hobby project with potential bugs and security flaws. Do not expose the server to the public internet and don't trust the server to be invulnerable.

## Security Considerations

The server assumes that the communication is over HTTP and is insecure, thus it uses JWT HS256-signed tokens to communicate and a session counter so that a request can't be copied by an attacker.

There is a built-in session counter that provides basic security. The session counter has a session limit of 10 and blocks new sessions after 10 sessions but you can increase this limit in the code. This is to protect against memory attacks.

The counter is incremented with each request and the counter value is included in the JWT which makes request forging impossible without the secret.

The security implementations DO NOT protect against request forging of other sessions. Anybody with the secret can pretend to be anybody else with the secret. This is intentional because session forging has no purpose when somebody has the secret, there isn't anything to gain by forging sessions(at least not in the current version of the application).
