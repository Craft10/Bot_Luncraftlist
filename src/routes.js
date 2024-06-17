const express = require('express');
const db = require('./database');
const BotVoter = require('./botVoter');
const client = require('./discordBot');

const router = express.Router();

router.get('/api/bots', (req, res) => {
	const sql = 'SELECT * FROM bots WHERE bot_status = 1';
	db.all(sql, [], (err, rows) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener los bots' });
			throw err;
		}
		res.send(rows);
	});
});

router.post('/api/vote', (req, res) => {
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

router.get('/api/votescount/:bot_id', (req, res) => {
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

router.get('/api/bots-all', (req, res) => {
	const sql = 'SELECT * FROM bots ';
	db.all(sql, [], (err, rows) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener los bots' });
			throw err;
		}
		res.send(rows);
	});
});


router.get('/api/bots_c', (req, res) => {
	const sql = 'SELECT * FROM bots WHERE bot_status = 0';
	db.all(sql, [], (err, rows) => {
		if (err) {
			res.status(500).send({ error: 'Error al obtener los bots' });
			throw err;
		}
		res.send(rows);
	});
});

router.get('/api/bots/:id', (req, res) => {
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

router.get('/api/bot_owner/:id', (req, res) => {
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




function getBotNameById(botId) {
	const bot = client.users.cache.get(botId);
	if (bot) {
		return bot.username;
	} else {
		return 'Bot no encontrado';
	}
}


router.post('/api/bots', (req, res) => {
	const { bot_owner, bot_id, bot_prefix, bot_category, bot_corta, bot_larga, bot_web, bot_invite, bot_suport, bot_status } = req.body;
	const sql = 'INSERT INTO bots(bot_owner, bot_id, bot_prefix, bot_category, bot_corta, bot_larga, bot_web, bot_invite, bot_suport, bot_status) VALUES(?,?,?,?,?,?,?,?,?,?)';
	db.run(sql, [bot_owner, bot_id, bot_prefix, bot_category, bot_corta, bot_larga, bot_web, bot_invite, bot_suport, bot_status], function(err) {
		if (err) {
			res.status(500).send({ error: 'Error al agregar el bot' });
			throw err;
		}
		console.log(`Bot agregado con ID ${this.lastID}`);

		const channelId = '1111033986928619561';
    const botId = bot_id;
    const botName = getBotNameById(botId);
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      const message = `**__⚙️ | El Bot ${botName} fue agregado, Pendiente__**`;
      channel.send(message);
    }

		res.send({ id: this.lastID });
	});
});

router.delete('/api/bots/:id', (req, res) => {
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

router.put('/api/bots/aceptar/:id', (req, res) => {
	const sql = 'UPDATE bots SET bot_status = 1 WHERE id = ?';
	const id = req.params.id;
	db.run(sql, [id], (err) => {
		if (err) {
			res.status(500).send({ error: 'Error al aceptar el bot' });
			throw err;
		}
		const channelId = '1111033986928619561';
    const botId = id;
    const botName = getBotNameById(botId);
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      const message = `**__✅ | El Bot ${botName} fue Aceptado en Luncraftlist__**`;
      channel.send(message);
    }
		res.send({ message: `El bot con id ${id} ha sido aceptado` });
	});
});

router.put('/api/bots/:id/rechazar', (req, res) => {
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
      const message = `**__❌ | El Bot ${botName} fue rechazado__**`;
      channel.send(message);
	}
		res.send({ message: `El bot con id ${id} ha sido rechazado` });
	});
});


module.exports = router;
