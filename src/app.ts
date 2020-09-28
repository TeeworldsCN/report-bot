import Mirai from "mirai-ts";
import { Message, log, check, MessageType, EventType } from "mirai-ts";
import dotenv from "dotenv";

dotenv.config();

// Bot Number
const BOT_NUMBER = parseInt(process.env.bot_number);

// Admin
const ADMINS = process.env.bot_admin.split('|').map((n)=>parseInt(n));
const MODS = process.env.bot_mods.split('|').map((n)=>parseInt(n));

// Mirai Config
const mahConfig = {
  host: process.env.mirai_host,
  port: parseInt(process.env.mirai_port),
  authKey: process.env.mirai_auth,
  enableWebsocket: false,
};

const mirai = new Mirai(mahConfig);

async function app() {
  await mirai.link(BOT_NUMBER);

  // Refuse friend request
  mirai.on("NewFriendRequestEvent", (event) => {
    event.respond(1);
  });

  mirai.listen();
}

app();