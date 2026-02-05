const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { wsSend } = require('../server/websocketServer');


const voiceConnections = {};

function join(channel) {
	if (!channel || !channel.guild) {
		throw new Error('Invalid voice channel');
	}

	const guildId = channel.guild.id;

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

	// const speakingMap = new SpeakingMap();

	voiceConnections[guildId] = {
		connection,
		speakingState: {},
		// userId -> true/false
		userActiveState: {},
		// userId -> true/false
		combinedState: {},
		// userId -> true/false (isActive && speaking)
	};


	// Track SpeakingMap start/end events
	connection.receiver.speaking.on('start', userId => {
		voiceConnections[guildId].speakingState[userId] = true;
		updateCombinedState(guildId, userId);
	});

	connection.receiver.speaking.on('end', userId => {
		voiceConnections[guildId].speakingState[userId] = false;
		updateCombinedState(guildId, userId);
	});

	return connection;
}


function leave(guildId) {
	const data = voiceConnections[guildId];
	if (!data) {
		return false;
	}
	data.connection.destroy();
	delete voiceConnections[guildId];
	return true;
}

// Called by index.js when isActive changes
function updateUserState(guildId, userId, isActive) {
	if (!voiceConnections[guildId]) return;

	voiceConnections[guildId].userActiveState[userId] = isActive;
	updateCombinedState(guildId, userId);
}

const THROTTLE_MS = 150;

function updateCombinedState(guildId, userId) {
	const vc = voiceConnections[guildId];
	if (!vc) return;

	if (!vc.lastSentAt) {
		vc.lastSentAt = {};
	}

	const active = vc.userActiveState[userId] || false;
	const speaking = vc.speakingState[userId] || false;
	const combined = active && speaking;

	const previous = vc.combinedState[userId];
	if (previous !== combined) {
		console.log(`Signal: ${userId} isTalking=${combined}`);
		vc.combinedState[userId] = combined;

		const now = Date.now();
		const lastSent = vc.lastSentAt[userId] || 0;
		const timeSinceLast = now - lastSent;

		// --- THROTTLE CHECK ---
		if (timeSinceLast < THROTTLE_MS) {
			return; // too soon, skip sending
		}

		vc.lastSentAt[userId] = now;

		const message = {
			type: 'voiceUpdate',
			guildId,
			userId,
			isTalking: combined,
			timestamp: now,
		};

		console.log('Sending message:', message); // optional debug
		wsSend(message);


	}
}

module.exports = {
	join,
	leave,
	updateUserState,
	voiceConnections,
};
