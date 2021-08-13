// Discord bot basic, by NorthWestWind

import * as Discord from "discord.js";
import { Handler } from "./handler";
import dotenv from "dotenv";
import { BotClient } from "./types/client";
// Load environment variables
dotenv.config();

// Client initialization
const client = new BotClient({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
    intents: [
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES
    ]
});
// Edit this to change prefix
client.prefix = "%";

// Call the handler to set up
Handler.setup(client, process.env.TOKEN);