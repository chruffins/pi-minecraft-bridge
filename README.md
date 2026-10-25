# Pi Minecraft Chat Bridge

A small Pi Coding Agent extension that connects a Mineflayer bot to a **Minecraft Java Edition** server. Players can send `!pi hello` in game; Pi receives that as a prompt, and its next assistant reply is posted to Minecraft chat.

## LAN support

Yes. The computer running Pi must be able to reach the Minecraft server over the LAN. Set `MC_HOST` to the server computer's local IP address (for example `192.168.1.50`) and `MC_PORT` to its port (usually `25565`). The server must be listening on the LAN interface, and its firewall must allow that inbound port. The Minecraft client does not need to run on the same computer as Pi. This does not provide a public internet tunnel.

## Install with Pi

Install the extension directly from GitHub:

```sh
pi install git:github.com/chruffins/pi-minecraft-bridge
```

Restart Pi (or reload extensions), then configure the server connection and use the bridge as described below. Pi installs the extension's declared runtime dependencies automatically.

## Use the bridge

Set the connection settings before starting Pi. `MC_HOST` is required; the remaining variables are optional:

| Variable | Default | Purpose |
|---|---|---|
| `MC_HOST` | — | Minecraft Java server hostname or IP (required) |
| `MC_PORT` | `25565` | Server port |
| `MC_USERNAME` | `PiChatBridge` | Bot account name |
| `MC_AUTH` | offline mode | Set to `microsoft` for Microsoft authentication |
| `MC_PREFIX` | `!pi` | Only in-game messages beginning with this prefix are sent to Pi; empty accepts all chat |
| `MC_REPLY_PREFIX` | `[Pi]` | Prefix added to Pi's in-game replies |

In Pi, run `/mc-connect` to connect. Players can then write `!pi hello` in game; Pi receives the text after the prefix and sends its response back to public chat. Run `/mc-disconnect` to stop the bot. The bot account must be allowed to join the server.

Configure the extension through environment variables. For example, on macOS/Linux:

```sh
MC_HOST=192.168.1.50 MC_PORT=25565 MC_USERNAME=PiChatBridge pi
```

On Windows PowerShell, set environment variables before starting Pi:

```powershell
$env:MC_HOST = "192.168.1.50"
$env:MC_PORT = "25565"
$env:MC_USERNAME = "PiChatBridge"
pi
```

For local development, clone the repository, run `npm ci`, and load it with `pi --extension ./index.ts` from the checkout. `.env.example` documents the available settings; the extension reads environment variables directly and does not load a `.env` file itself.

## Notes and limitations

- This prototype targets Minecraft **Java Edition**. Bedrock requires a different protocol/client library.
- The server must allow the bot account to join. Online-mode servers may require Microsoft authentication; set `MC_AUTH=microsoft` if needed.
- Only messages starting with `MC_PREFIX` (default `!pi`) are forwarded. Replies are prefixed with `[Pi]`.
- The bot posts the next assistant response after a game prompt. This is an early prototype; test it on a private server first. Do not expose server credentials, and avoid using this on servers where bots are prohibited.
