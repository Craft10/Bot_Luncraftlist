const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env['TOKEN'];
const prefix = 'l!';

const statuses = [
	{ name: '- !! Luncraftlist !!', type: 'WATCHING' },
	{ name: '- Bots de la Comunidad', type: 'STREAMING' }
];

let currentStatusIndex = 0;

client.on('ready', () => {
	console.log(`Bot iniciado como ${client.user.tag}!`);

	setInterval(() => {
		updateStatus();
	}, 6000);


	updateStatus();

});

function updateStatus() {
	const status = statuses[currentStatusIndex];
	client.user.setPresence({
		activity: {
			name: status.name,
			type: status.type
		},
		status: 'online'
	});

	currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
}

client.on('message', message => {
	if (message.author.bot || !message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	// Comando de prueba
	if (command === 'ping') {
		const startTime = Date.now();
		message.channel.send('Calculando ping...').then(msg => {
			const endTime = Date.now();
			msg.edit(`Pong! El ping es ${endTime - startTime}ms`);
		});
	}

	if (command === 'bots') {
		const sql = 'SELECT * FROM bots WHERE bot_status = 1';
		db.all(sql, [], (err, rows) => {
			if (err) {
				console.error(err.message);
				return message.channel.send('Error al obtener los bots');
			}
			const botList = rows.map(bot => `**Bot_ID:** ${bot.id}\n**Nombre del Bot:** ${bot.bot_owner}\n**Categoría:** ${bot.bot_category}\n\n`);
			const embed = new Discord.MessageEmbed()
				.setColor('#27AE60')
				.setTitle('Esta es la Lista de Bots')
				.setDescription(botList.join(''))
				.setTimestamp();
			message.channel.send(embed);
		});
	}

	if (command === 'createTable') {
		db.run(`
      CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  bot_id TEXT,
  timestamp INTEGER
);`, (error) => {
			if (error) {
				console.error(error.message);
				return message.reply('Ocurrió un error al crear la tabla.');
			}
			message.reply('La tabla "votes" se ha creado con éxito.');
		});
	}

	if (command === 'addbot') {
		const bot_owner = message.author.id;
		const bot_id = args[0];
		const bot_category = args[1];
		const bot_corta = args[2];
		const bot_larga = args[3];
		const bot_web = args[4];
		const bot_invite = args[5];
		const bot_suport = args[6];

		db.run('INSERT INTO bots (bot_owner, bot_id, bot_category, bot_corta, bot_larga, bot_web, bot_invite, bot_suport) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [bot_owner, bot_id, bot_category, bot_corta, bot_larga, bot_web, bot_invite, bot_suport], function(err) {
			if (err) {
				return console.log(err.message);
			}
			const logChannel = client.channels.cache.get('1096975246654972025');
			if (logChannel) {
				const logEmbed = new Discord.MessageEmbed()
					.setTitle('Nuevo bot agregado')
					.setDescription(`Se agregó un nuevo bot: ${bot_corta}`)
					.setColor('#0099ff')
					.setTimestamp();
				logChannel.send(logEmbed);
			}
			console.log(`Bot agregado con ID ${this.lastID}`);
			message.channel.send(`Bot agregado con ID ${this.lastID}`);
		});
	}

	if (command === 'botinfo') {
		const bot_id = args[0];

		db.get('SELECT * FROM bots WHERE bot_id = ?', [bot_id], function(err, row) {
			if (err) {
				return console.log(err.message);
			}
			if (!row) {
				return message.channel.send('Bot no encontrado');
			}

			message.channel.send(`Información de ${row.bot_id}:\nCategoría: ${row.bot_category}\nDescripción corta: ${row.bot_corta}\nDescripción larga: ${row.bot_larga}\nSitio web: ${row.bot_web}\nInvitación: ${row.bot_invite}\nServidor de soporte: ${row.bot_suport}`);
		});
	}

	if (command === 'vote') {
		voteCommand(message, args);
	}

	if (command === 'votescount') {
		votesCountCommand(message, args);
	}

});

client.login(token);

module.exports = client;
