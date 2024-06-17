const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env['TOKEN'];
const prefix = 'l!';
const app = express();
const APIClient = require('./apiClient');
const baseURL = 'https://b80184f1-ebbe-404f-af41-9812aba31fbb-00-1dwbcmzb81ma5.spock.replit.dev';
const { getBotNameById, getUserNameById }  = require('./src/function');
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database('database.db', (err) => {
	if (err) {
		console.error(err.message);
	} else {
		console.log('Conexión exitosa a la base de datos SQLite3');
	}
})
function getTables(databaseFile) {
	const db = new sqlite3.Database(databaseFile);

	return new Promise((resolve, reject) => {
		db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
			if (err) {
				reject(err);
			} else {
				const tables = rows.map(row => row.name);
				resolve(tables);
			}
		});
	});
}

class BotVoter {

	constructor(botId) {
		this.botId = botId;
	}

	vote(userId) {
		return new Promise((resolve, reject) => {

			// Verificar si el usuario ya votó por este bot
			db.get('SELECT * FROM votes WHERE user_id = ? AND bot_id = ?', [userId, this.botId], (err, row) => {
				if (err) {
					console.error(err);
					reject(err);
				} else {
					if (row) {
						// El usuario ya votó, quitar el voto
						db.run('DELETE FROM votes WHERE user_id = ? AND bot_id = ?', [userId, this.botId], (err) => {

							if (err) {
								console.error(err);
								reject(err);
							} else {
								resolve(false); // Voto eliminado
							}
						});
					} else {
						// El usuario no votó, agregar el voto
						const timestamp = Date.now();
						db.run('INSERT INTO votes (user_id, bot_id, timestamp) VALUES (?, ?, ?)', [userId, this.botId, timestamp], (err) => {

	if (err) {
								console.error(err);
								reject(err);
							} else {
								resolve(true); // Voto agregado
		class DiscordAPI {
  constructor(token) {
    this.token = token;
  }
  
  async getUserName(userId) {
    try {
      const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bot ${this.token}`
        }
      });
      const data = await response.json();
      return data.username;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }
}

const discordApi = new DiscordAPI(token);
const channelId = '1111034684558819460';
const api = new APIClient(baseURL);

(async () => {
  try {
    const botName = await discordApi.getUserName(this.botId); // Cambia this.botId por el ID del bot
    const bot = client.users.cache.get(userId);
    const userName = bot.username; 
    const channel = client.channels.cache.get(channelId);

    this.getVotesCount()
      .then((count) => {
        const number = count;
        const message = `**${userName}** Voto Por **${botName}** Votes: **${number}**`;

        if (channel) {
          channel.send(message);
        }
      })
      .catch((err) => {
        const number = "0";
        const message = `**${userName}** Voto Por **${botName}** Votes: **${number}**`;

        if (channel) {
          channel.send(message);
        }
      });
  } catch (error) {
    console.error('Error:', error.message);
  }
})();


			   
    
								
							}
						});
					}
				}
			});
		});
	}

	getVotesCount() {
		return new Promise((resolve, reject) => {
			db.get('SELECT COUNT(*) AS count FROM votes WHERE bot_id = ?', [this.botId], (err, row) => {
				if (err) {
					console.error(err);
					reject(err);
				} else {
					resolve(row.count);
				}
			});
		});
	}

}

function voteCommand(message, args) {
	const botId = args[0]; 
	const userId = message.author.id;

	const voter = new BotVoter(botId);
	voter.vote(userId)
		.then(() => {
			message.reply('Has votado por este bot correctamente.');

		})
		.catch((err) => {
			console.error(err);
			message.reply('Ha ocurrido un error al votar por este bot.');
		});
}

function votesCountCommand(message, args) {
	const botId = args[0];

	const voter = new BotVoter(botId);
	voter.getVotesCount()
		.then((count) => {
			message.reply(`El bot tiene ${count} votos.`);

		})
		.catch((err) => {
			console.error(err);
			message.reply('Ha ocurrido un error al obtener la cantidad de votos.');

		});
				}
					

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/bots', (req, res) => {
	const sql = 'SELECT * FROM bots WHERE bot_status = 1';
	db.all(sql, [], (err, rows) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener los bots' });
			throw err;
		}
		res.send(rows);
	});
});


app.get('/api/ad', (req, res) => {
	const sql = 'SELECT * FROM bots WHERE bot_status = 3';
	db.all(sql, [], (err, rows) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener los AD' });
			throw err;
		}
		res.send(rows);
	});
});
app.post('/api/vote', (req, res) => {
	const { user_id, bot_id } = req.body;

	const voter = new BotVoter(bot_id);
	voter.vote(user_id)
		.then(() => {
			res.status(200).send('Voto registrado correctamente');
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error al registrar el voto');
		});
});

app.get('/api/votescount/:bot_id', (req, res) => {
	const { bot_id } = req.params;

	const voter = new BotVoter(bot_id);
	voter.getVotesCount()
		.then((count) => {
			res.status(200).json({ count });
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error al obtener la cantidad de votos');
		});
});

app.get('/api/bots-all', (req, res) => {
	const sql = 'SELECT * FROM bots ';
	db.all(sql, [], (err, rows) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener los bots' });
			throw err;
		}
		res.send(rows);
	});
});

app.get('/api/bots_c', (req, res) => {
	const sql = 'SELECT * FROM bots WHERE bot_status = 0';
	db.all(sql, [], (err, rows) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener los bots' });
			throw err;
		}
		res.send(rows);
	});
});

app.get('/api/bots/:id', (req, res) => {
	const sql = 'SELECT * FROM bots WHERE bot_id = ? AND bot_status = 1';
	const id = req.params.id;
	db.get(sql, [id], (err, row) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener el bot' });
			throw err;
		}
		if (!row) {
			res.status(404).send({ error: `No se encontró el bot con id ${id}` });
		} else {
			res.send(row);
		}
	});
});

app.get('/api/bot_owner/:id', (req, res) => {
	const sql = 'SELECT * FROM bots WHERE bot_owner = ? AND bot_status = 1';
	const id = req.params.id;
	db.all(sql, [id], (err, row) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener el bot' });
			throw err;
		}
		if (!row) {
			res.status(404).send({ error: `No se encontró el bot con id ${id}` });
		} else {
			res.send(row);
		}
	});
});

app.post('/api/bots', (req, res) => {
	const { bot_owner, bot_id, bot_prefix, bot_category, bot_corta, bot_larga, bot_web, bot_invite, bot_suport, bot_status } = req.body;
	const sql = 'INSERT INTO bots(bot_owner, bot_id, bot_prefix, bot_category, bot_corta, bot_larga, bot_web, bot_invite, bot_suport, bot_status) VALUES(?,?,?,?,?,?,?,?,?,?)';
	db.run(sql, [bot_owner, bot_id, bot_prefix, bot_category, bot_corta, bot_larga, bot_web, bot_invite, bot_suport, bot_status], function(err) {
		if (err) {
			res.status(500).send({ error: 'Error al agregar el bot' });
			throw err;
		}
		console.log(`Bot agregado con ID ${this.lastID}`);

const discordApi = new DiscordAPI(token);
		const channelId = '1111033986928619561';
    const botId = bot_id;
    const botName = discordApi.getUserName(botId);
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      const message = `⚙️ - El Bot **${botName}** fue agregado en Luncraftlist`;
      channel.send(message);
    }

		res.send({ id: this.lastID });
	});
});

app.delete('/api/bots/:id', (req, res) => {
	const sql = 'DELETE FROM bots WHERE id = ?';
	const id = req.params.id;
	db.run(sql, [id], (err) => {
		if (err) {
			res.status(500).send({ error: 'Error al eliminar el bot' });
			throw err;
		}
		res.send({ message: `El bot con id ${id} ha sido eliminado` });
	});
});

app.put('/api/bots/aceptar/:id', (req, res) => {
	const sql = 'UPDATE bots SET bot_status = 3 WHERE id = ?';
	const id = req.params.id;
	db.run(sql, [id], (err) => {
		if (err) {
			res.status(500).send({ error: 'Error al aceptar el bot' });
			throw err;
		}
		const channelId = '1111034062031835216';
    const botId = id;
    const botName = getBotNameById(botId);
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      const message = `✅ - El Bot ${botName} fue Aceptado en Luncraftlist`;
      channel.send(message);
    }
		res.send({ message: `El bot con id ${id} ha sido aceptado` });
	});
});

app.put('/api/bots/:id/rechazar', (req, res) => {
	const sql = 'UPDATE bots SET bot_status = 0 WHERE id = ?';
	const id = req.params.id;
	db.run(sql, [id], (err) => {
		if (err) {
			res.status(500).send({ error: 'Error al rechazar el bot' });
			throw err;
		}
		const channelId = '1111033986928619561';
    const botId = id;
    const botName = getBotNameById(botId);
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      const message = `**❌ - El Bot ${botName} fue rechazado**`;
      channel.send(message);
	}
		res.send({ message: `El bot con id ${id} ha sido rechazado` });
	});
});

app.put('/bots/:id', (req, res) => {
    const botId = req.params.id;
    const nuevaDescripcionLarga = req.body.bot_larga;

    // Verificar si el bot con el ID proporcionado existe en la base de datos
    db.get('SELECT * FROM bots WHERE bot_id = ?', [botId], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Error en la base de datos.' });
            return;
        }

        if (!row) {
            res.status(404).json({ error: 'Bot no encontrado.' });
            return;
        }

        // Actualizar la descripción larga del bot
        db.run('UPDATE bots SET bot_larga = ? WHERE bot_id = ?', [nuevaDescripcionLarga, botId], (err) => {
            if (err) {
                res.status(500).json({ error: 'Error al actualizar la descripción larga.' });
                return;
            }

            res.status(200).json({ mensaje: 'Descripción larga actualizada con éxito.' });
        });
    });
});


/* db.run(`
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  bot_id TEXT,
  timestamp INTEGER
);

  CREATE TABLE IF NOT EXISTS bots (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	bot_owner TEXT NOT NULL,
	bot_id TEXT NOT NULL,
	bot_prefix TEXT,
	bot_category TEXT NOT NULL,
	bot_corta TEXT NOT NULL,
	bot_larga TEXT NOT NULL,
	bot_web TEXT,
	bot_invite TEXT,
	bot_suport TEXT,
	bot_status TEXT NOT NULL DEFAULT 0
  );

  
`, (err) => {
  if (err) {
	console.error(err.message);
  } else {
	console.log('Tablas creada o ya existente');
  }
});*/


app.listen(port, () => {
	console.log(`Servidor iniciado en el puerto ${port}`);
	const databaseFile = 'database.db';
	getTables(databaseFile)
		.then(tables => {
			tables.forEach(table => {
				console.log(table);
			});
		})
		.catch(err => {
			console.error(err);
		});

});


const statuses = [
	{ 
		name: '- Luncraftlist Online',
		type: 'WATCHING' 
	},
	{ 
		name: '- Bots de la Comunidad',
		type: 'STREAMING' 
	},
	{ 
		name: 'Disfruta de Luncraftlist con Bots Seguros',
		type: 'WATCHING' 
	}
];

let currentStatusIndex = 0;

const colorJoin = '#00ff00'; 
const colorLeave = '#ff0000';

client.on('guildMemberAdd', (member) => {
  const embed = new Discord.MessageEmbed()
    .setColor(colorJoin)
    .setTitle('👋 - New User')
    .setDescription(`¡hello ${member.user.tag}, Welcome to the Luncraftlist server, Please read the <#1136847654018625556>!`)
    .setTimestamp();

  const channelId = '1111092475495456861';
  const channel = member.guild.channels.cache.get(channelId);

  if (channel) {
    channel.send(embed);
  }
});

client.on('guildMemberRemove', (member) => {
  const embed = new Discord.MessageEmbed()
    .setColor(colorLeave)
    .setTitle('👋 - GoodBye')
    .setDescription(`See you later  ${member.user.tag} .`)
    .setTimestamp();
	
  const channelId = '1111092475495456861';
  const channel = member.guild.channels.cache.get(channelId);

  if (channel) {
	channel.send(embed);
  }
});


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
		message.channel.send('**🕕 - Calculando ping esto puede tardar un Poco..**').then(msg => {
			const endTime = Date.now();
			msg.edit(`**Mi El ping actual es __${endTime - startTime}__ms**`);
		});
	}

	if (command === 'bots') {
		const sql = 'SELECT * FROM bots WHERE bot_status = 1';
		db.all(sql, [], (err, rows) => {
			if (err) {
				console.error(err.message);
				return message.channel.send('Error al obtener los bots');
			}
			const botList = rows.map(bot => `**Bot ID:** ${bot.id}\n**Bot Name:** ${bot.bot_owner}\n**Categoría:** ${bot.bot_category}\n\n`);
			const embed = new Discord.MessageEmbed()
				.setColor('#27AE60')
				.setTitle('Bots Luncraftlist')
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

	if (command === 'bot_info') {
		const bot_id = args[0];

		db.get('SELECT * FROM bots WHERE bot_id = ?', [bot_id], function(err, row) {
			if (err) {
				return console.log(err.message);
			}
			if (!row) {
				return message.channel.send('Bot no encontrado');
			}
			
message.channel.send(`Information\nCategoría: ${row.bot_category}\nDescripción: ${row.bot_corta}\nInvitación: ${row.bot_invite}\n`);
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