import { CommandInteraction, Message } from "discord.js";
import { SlashCommand } from "../types/command";

class PingCommand extends SlashCommand {
    name = "ping";
    description = "Pings the bot.";

    async execute(interaction: CommandInteraction) {
        await interaction.reply("Pong!");
    }

    async run(message: Message) {
        await message.channel.send("Pong!");
    }
    
}