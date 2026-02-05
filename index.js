const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const voiceStateMap = new Map();

const { updateUserState } = require('./voice/voiceManager');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

// Log in to Discord with your client's token
client.login(token);

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
		else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
	const userId = newState.member?.id;
	if (!userId) return;

	if (newState.channelId === null) {
		voiceStateMap.delete(userId);

		console.log({
			userId,
			active: false,
			reason: 'left voice',
		});

		return;
	}

	const voiceSnapshot = {
		userId,
		channelId: newState.channelId,
		selfMuted: newState.selfMute,
		serverMuted: newState.mute,
		deafened: newState.deaf || newState.selfDeaf,
	};

	const previousState = voiceStateMap.get(userId);
	voiceStateMap.set(userId, voiceSnapshot);

	const hasChanged =
	!previousState ||
	previousState.channelId !== voiceSnapshot.channelId ||
	previousState.selfMuted !== voiceSnapshot.selfMuted ||
	previousState.serverMuted !== voiceSnapshot.serverMuted ||
	previousState.deafened !== voiceSnapshot.deafened;

	if (!hasChanged) return;

	const isActive =
	voiceSnapshot.channelId !== null &&
	!voiceSnapshot.selfMuted &&
	!voiceSnapshot.serverMuted &&
	!voiceSnapshot.deafened;

	const guildId = newState.guild.id;

	updateUserState(guildId, userId, isActive);

	console.log({
		userId,
		active: isActive,
	});

});
