const { SlashCommandBuilder, ChannelType } = require('discord.js');
const voiceManager = require('../../voice/voiceManager.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Make the bot join a voice channel')
		.addChannelOption(option =>
			option
				.setName('channel')
				.setDescription('Pick a voice channel')
				.addChannelTypes(ChannelType.GuildVoice)
				.setRequired(false),
		),
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') || interaction.member.voice.channel;
		if (!channel) return interaction.reply({ content: 'You must be in a voice channel or select one!', ephemeral: true });

		voiceManager.join(channel);
		await interaction.reply(`Joined **${channel.name}** 🎧`);
	},
};
