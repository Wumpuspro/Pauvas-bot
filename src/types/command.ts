import * as Discord from "discord.js";

export abstract class Command {
    abstract name: string;
    abstract description: string;
    aliases?: string[];

    abstract run(message: Discord.Message, args: string[]): any | Promise<any>;
}

export abstract class SlashCommand extends Command {
    options?: any[];

    abstract execute(interaction: Discord.CommandInteraction): any | Promise<any>;
}