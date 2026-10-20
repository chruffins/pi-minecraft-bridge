# Pi Minecraft Chat Bridge

A small Pi Coding Agent extension that connects a Mineflayer bot to a **Minecraft Java Edition** server. Players can send `!pi hello` in game; Pi receives that as a prompt, and its next assistant reply is posted to Minecraft chat.

## LAN support

Yes. The computer running Pi must be able to reach the Minecraft server over the LAN. Set `MC_HOST` to the server computer's local IP address (for example `192.168.1.50`) and `MC_PORT` to its port (usually `25565`). The server must be listening on the LAN interface, and its firewall must allow that inbound port. The Minecraft client does not need to run on the same computer as Pi. This does not provide a public internet tunnel.

## Setup

1. Install Node.js (18 or newer), then from this directory run `npm install`.
2. Copy `.env.example` to `.env` and set `MC_HOST`, `MC_PORT`, and `MC_USERNAME`.
3. Load the extension in Pi:

   ```sh
   pi --extension ./index.ts
   ```

   Or copy this project into Pi's extensions directory.
4. In Pi, run `/mc-connect`. In game, send `!pi hello`. Run `/mc-disconnect` to stop the bot.

The extension reads its settings from the environment. For example, on macOS/Linux:

```sh
MC_HOST=192.168.1.50 MC_PORT=25565 MC_USERNAME=PiChatBridge pi --extension ./index.ts
```

On Windows PowerShell, set environment variables before starting Pi:

```powershell
$env:MC_HOST = "192.168.1.50"
$env:MC_PORT = "25565"
$env:MC_USERNAME = "PiChatBridge"
pi --extension ./index.ts
```

## Notes and limitations

- This prototype targets Minecraft **Java Edition**. Bedrock requires a different protocol/client library.
- The server must allow the bot account to join. Online-mode servers may require Microsoft authentication; configure Mineflayer authentication as appropriate.
- Only messages starting with `MC_PREFIX` (default `!pi`) are forwarded. Replies are prefixed with `[Pi]`.
- The bot posts the next assistant response after a game prompt. This is an early prototype; test it on a private server first. Do not expose server credentials, and avoid using this on servers where bots are prohibited.
