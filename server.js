const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/notes', (req, res) => {
	fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
		const notes = JSON.parse(data);
		res.json(notes);
	});
});

app.post('/api/notes', (req, res) => {
	const note = req.body;
	note.id = uuidv4();

	fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
		const notes = JSON.parse(data);

		notes.push(note);

		fs.writeFile(
			path.join(__dirname, 'db', 'db.json'),
			JSON.stringify(notes),
			(err) => {
				if (err) {
					console.error(err);
					return res
						.status(500)
						.json({ error: 'Internal Server Error' });
				}
			}
		);
	});
});

app.delete('/api/notes/:id', (req, res) => {
	const noteId = req.params.id;
	const findNote = notes.findIndex((note) => note.id === noteId);
	if (findNote !== -1) {
		const deleteNote = notes.splice(findNote, 1)[0];
		res.json(deleteNote);
	} else {
		res.status(404).json({ message: 'Note not found' });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on port http://localhost:${PORT}`);
});
