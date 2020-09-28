import Mirai from "mirai-ts";
import { Message, log, check, MessageType, EventType } from "mirai-ts";
import dotenv from "dotenv";

const TTL = 120;

const cache: {
  [messageId: number]: {
    time: number,
    requester: number
  }
} = {};

const cachePut = (messageId: number, requester: number) => {
  cache[messageId] = {
    time: Date.now(),
    requester,
  }
}

const cacheGet = (messageId: number) => {
  if(cache[messageId]) {
    if (Date.now() < cache[messageId].time + TTL * 60000) {
      const requester = cache[messageId].requester;
      for (const msg in cache) {
        if (Date.now() < cache[msg].time + TTL * 60000) {
          delete cache[msg];
        }
      }
      return requester;
    }
    return -1;
  }
}

dotenv.config();

// Bot Number
const BOT_NUMBER = parseInt(process.env.bot_number);

// Admin
const ADMINS = process.env.bot_admin.split('|').map((n)=>parseInt(n));
const MODS = process.env.bot_mods.split('|').map((n)=>parseInt(n));

const isAdmin = (msg: MessageType.ChatMessage) => {
  return ADMINS.indexOf(msg.sender.id) >= 0;
}

const isMod = (msg: MessageType.ChatMessage) => {
  return MODS.indexOf(msg.sender.id) >= 0;
}

const sendToGroup = (msg: MessageType.ChatMessage) => {
  mirai.api.sendGroupMessage
}

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
  mirai.on("NewFriendRequestEvent", async (event) => {
    event.respond(1);
  });

  mirai.on("GroupMessage", async (msg) => {
    if (check.isAt(msg, BOT_NUMBER)) {
      const message = [Message.At(msg.sender.id), Message.Plain("请求已收到！召唤管理：")];
      for (const mod of MODS) {
        message.push(Message.At(mod));
      }
      const sent = await mirai.api.sendGroupMessage(message, msg.sender.group.id);
      cachePut(sent.messageId, msg.sender.id);
    }
  })

  mirai.on("GroupRecallEvent", async (msg) => {
    const requester = cacheGet(msg.messageId);
    const message = [Message.At(requester), Message.Plain("：管理 ["), Message.Plain(msg.operator.memberName), Message.Plain("] 正在处理你的请求。")];
    if (requester > 0) {
      await mirai.api.sendGroupMessage(message, msg.group.id);
    }
  })
  mirai.listen();
}

app();