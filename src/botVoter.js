const sqlite3 = require('sqlite3').verbose();

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
