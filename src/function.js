const Discord = require('discord.js');
const client = new Discord.Client();

function getBotNameById(botId) {
	const bot = client.users.cache.get(botId);
	if (bot) {
		return bot.username;
	} else {
		return 'Bot Undefine';
	}
}

function getUserNameById(userId) {
    const user = client.users.cache.get(userId);
    
    if (user) {
        return user.username;
    } else {
        return 'User Undefine';
    }
}

module.exports = {
  getBotNameById,
  getUserNameById,
};