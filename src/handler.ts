import * as Discord from "discord.js";
import { BotClient } from "./types/client";
import { Command, SlashCommand } from "./types/command";
import { deepReaddir } from "./utils";

export const commands = new Discord.Collection<string, Command>();

export class Handler {
    static setup(client: BotClient, token: string) {
        // Create bot handler
        new Handler(client);
        // Login with the token
        client.login(token);
    }

    private constructor(client: Discord.Client) {
        // Add all event listeners
        client.once("ready", () => this.ready(client));
        client.on("guildMemberAdd", member => this.guildMemberAdd(member));
        client.on("guildMemberRemove", member => this.guildMemberRemove(member));
        client.on("guildCreate", guild => this.guildCreate(guild));
        client.on("guildDelete", guild => this.guildDelete(guild));
        client.on("voiceStateUpdate", (oldState, newState) => this.voiceStateUpdate(oldState, newState));
        client.on("guildMemberUpdate", (oldMember, newMember) => this.guildMemberUpdate(oldMember, newMember));
        client.on("messageReactionAdd", (reaction, user) => this.messageReactionAdd(reaction, user));
        client.on("messageReactionRemove", (reaction, user) => this.messageReactionRemove(reaction, user));
        client.on("messageDelete", message => this.messageDelete(message));
        client.on("messageCreate", message => this.messageCreate(message));
        client.on("interactionCreate", interaction => this.interactionCreate(interaction));
    }

    // Load all the commands from a path
    async loadCommands(path: string) {
        const commandFiles = deepReaddir(path).filter(file => file.endsWith(".js"));
        // Put the commands into memory, so we can find them more easily
        for (const file of commandFiles) {
            const command = <Command> (await import(file)).default;
            commands.set(command.name, command);
        }
    }
    async ready(client: Discord.Client) {
        // Load all commands on ready
        await this.loadCommands("./out/commands");

        // Register Slash Commands
        for (const command of commands.values()) {
            // If command is not Slash Command, skip it
            if (!(command instanceof SlashCommand)) continue;
            try {
                // Create the Slash Command
                await client.application?.commands.create({
                    name: command.name,
                    description: command.description,
                    options: command.options
                });
            } catch (err) {
                console.log("Failed to create slash command " + command.name);
                console.error(err);
            }
        }
    }
    async guildMemberAdd(member: Discord.GuildMember) { }
    async guildMemberRemove(member: Discord.GuildMember | Discord.PartialGuildMember) { }
    async guildCreate(guild: Discord.Guild) { }
    async guildDelete(guild: Discord.Guild) { }
    async voiceStateUpdate(oldState: Discord.VoiceState, newState: Discord.VoiceState) { }
    async guildMemberUpdate(oldMember: Discord.GuildMember | Discord.PartialGuildMember, newMember: Discord.GuildMember) { }
    async messageReactionAdd(reaction: Discord.MessageReaction | Discord.PartialMessageReaction, user: Discord.User | Discord.PartialUser) { }
    async messageReactionRemove(reaction: Discord.MessageReaction | Discord.PartialMessageReaction, user: Discord.User | Discord.PartialUser) { }
    async messageDelete(message: Discord.Message | Discord.PartialMessage) { }
    async messageCreate(message: Discord.Message) {
        const client = <BotClient> message.client;
        // Prefix check
        if (!message.content.startsWith(client.prefix)) return;
        // Remove the prefix from the message, and split it into array by space key
        const args = message.content.slice(client.prefix.length).split(/ +/);
        // Get the first argument as command name and find the command
        const commandName = args.shift().toLowerCase();
        const command = commands.get(commandName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        // Don't run if no command was found
        if (!command) return;
        try {
            await command.run(message, args);
        } catch (err) {
            console.error(err);
        }
    }
    async interactionCreate(interaction: Discord.Interaction) {
        if (!interaction.isCommand()) return;
        const command = commands.get(interaction.commandName);
        // If the command doesn't exist or is not Slash Command, don't run it.
        if (!command || !(command instanceof SlashCommand)) return;
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
        }
    }
}