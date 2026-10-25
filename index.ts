import mineflayer from "mineflayer";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

let bot: ReturnType<typeof mineflayer.createBot> | undefined;
let connected = false;
let lastBotChatAt = 0;
let pendingGameReply = false;
const env = (key: string, fallback = "") => process.env[key] || fallback;

export default function (pi: ExtensionAPI) {
  pi.registerCommand("mc-connect", {
    description: "Connect Pi's chat bridge to a Minecraft Java server",
    handler: async (_args, ctx) => {
      if (bot) {
        ctx.ui.notify("Minecraft bridge is already connecting or connected.", "info");
        return;
      }
      const host = env("MC_HOST");
      if (!host) {
        ctx.ui.notify("Set MC_HOST (and optionally MC_PORT, MC_USERNAME) before connecting.", "error");
        return;
      }
      try {
        bot = mineflayer.createBot({
          host,
          port: Number(env("MC_PORT", "25565")),
          username: env("MC_USERNAME", "PiChatBridge"),
          ...(env("MC_AUTH") ? { auth: env("MC_AUTH") as "microsoft" } : {}),
        });
        bot.on("login", () => {
          connected = true;
          ctx.ui.notify(`Minecraft chat bridge connected to ${host}.`, "info");
        });
        bot.on("messagestr", (message) => {
          if (!connected) return;
          const prefix = env("MC_PREFIX", "!pi");
          if (prefix && !message.trimStart().startsWith(prefix)) return;
          const text = prefix ? message.trimStart().slice(prefix.length).trim() : message.trim();
          if (text) {
            pendingGameReply = true;
            pi.sendUserMessage(`[Minecraft chat] ${text}`, { deliverAs: "followUp" });
          }
        });
        bot.on("end", () => {
          connected = false;
          bot = undefined;
          ctx.ui.notify("Minecraft chat bridge disconnected.", "warning");
        });
        bot.on("error", (error) => ctx.ui.notify(`Minecraft bridge: ${error.message}`, "error"));
      } catch (error) {
        bot = undefined;
        ctx.ui.notify(`Could not connect: ${String(error)}`, "error");
      }
    },
  });

  pi.registerCommand("mc-disconnect", {
    description: "Disconnect the Minecraft chat bridge",
    handler: async (_args, ctx) => {
      const current = bot;
      bot = undefined;
      connected = false;
      pendingGameReply = false;
      current?.quit("Pi bridge disconnected");
      ctx.ui.notify("Minecraft chat bridge disconnected.", "info");
    },
  });

  // Wait for the complete agent loop, then relay only if that loop actually
  // contains a Minecraft-originated user message. This avoids leaking arbitrary
  // assistant replies (including tool-call intermediate messages) into public chat.
  pi.on("agent_end", async (event) => {
    if (!connected || !bot || !pendingGameReply || Date.now() - lastBotChatAt < 1000) return;
    const fromGame = event.messages.some((message) => {
      if (message.role !== "user" || !("content" in message) || !Array.isArray(message.content)) return false;
      return message.content.some((part) => part.type === "text" && part.text.startsWith("[Minecraft chat] "));
    });
    if (!fromGame) return;
    const reply = [...event.messages].reverse().find((message) => message.role === "assistant" && "content" in message && Array.isArray(message.content));
    if (!reply || !("content" in reply) || !Array.isArray(reply.content)) return;
    const text = reply.content.filter((part) => part.type === "text").map((part) => part.text).join(" ").trim();
    if (!text) return;
    pendingGameReply = false;
    const safeText = text.replace(/[\r\n]+/g, " ").slice(0, 240);
    bot.chat(`${env("MC_REPLY_PREFIX", "[Pi]")} ${safeText}`);
    lastBotChatAt = Date.now();
  });

  pi.on("session_shutdown", async () => {
    const current = bot;
    bot = undefined;
    connected = false;
    pendingGameReply = false;
    current?.quit("Pi session ended");
  });
}
