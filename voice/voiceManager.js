const { joinVoiceChannel, getVoiceConnection, SpeakingMap } = require('@discordjs/voice');

const voiceConnections = {};

function join(channel) {
	if (!channel || !channel.guild) {
		throw new Error('Invalid voice channel');
	}

	const existingConnection = getVoiceConnection(channel.guild.id);

	if (existingConnection) {
		// Move to a new channel if needed
		if (existingConnection.joinConfig.channelId !== channel.id) {
			existingConnection.destroy();
		}
		else {
			return existingConnection;
		}
	}

	//  Create the voice connection
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});

	//  Create the SpeakingMap for this connection
	const speakingMap = new SpeakingMap();
	// optional if you want internal tracking

	connection.receiver.speaking.on('start', userId => {
		console.log(`${userId} started speaking`);
		// update your internal state here
	});

	connection.receiver.speaking.on('end', userId => {
		console.log(`${userId} stopped speaking`);
		// update your internal state here
	});

	voiceConnections[channel.guild.id] = { connection, speakingMap };

	//  Return the connection (no need to call joinVoiceChannel again!)
	return connection;
}


function leave(guildId) {
	const data = voiceConnections[guildId];
	if (data) {
		data.connection.destroy();
		delete voiceConnections[guildId];
		return true;
	}
	return false;
}


module.exports = {
	join,
	leave,
};