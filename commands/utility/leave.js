const { SlashCommandBuilder } = require('discord.js');
const voiceManager = require('../../voice/voiceManager');


/* module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Make the bot leave the voice channel'),
	async execute(interaction) {
		console.log('Leave command triggered');
		await interaction.reply('Test!');;

	},
};
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Make the bot leave the voice channel'),
	async execute(interaction) {
		console.log('Leave command triggered');
		try {
			const left = voiceManager.leave(interaction.guild.id);

			if (left) {
				await interaction.reply('Left the voice channel 👋');
			}
			else {
				await interaction.reply('I am not in a voice channel!');
			}
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'An error occurred while trying to leave.', ephemeral: true });
		}
	},
};
