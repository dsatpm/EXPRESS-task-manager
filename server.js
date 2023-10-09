// Module imports and Express setup
const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// Middleware for URL encoding, JSON parsing, and static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Array to store notes
let notes = [];

// Route to 'notes.html' file
app.get('/notes', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// Route to read and return notes as JSON
app.get('/api/notes', (req, res) => {
	fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
		const notes = JSON.parse(data);
		res.json(notes);
	});
});

// Save a new note route
app.post('/api/notes', (req, res) => {
	const newNote = req.body;
	newNote.id = uuidv4();

	// Read through notes and adds new note to 'db.json'
	fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
		const notes = JSON.parse(data);

		notes.push(newNote);

		fs.writeFile(
			path.join(__dirname, '/db/db.json'),
			JSON.stringify(notes),
			(err) => {
				if (err) {
					console.error(err);
					return res
						.status(500)
						.json({ error: 'Internal Server Error' });
				}
				res.json(newNote);
			}
		);
	});
});

// Deletes note by ID
app.delete('/api/notes/:id', (req, res) => {
	const noteId = req.params.id;

	// Read existing notes from the db.json file
	fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}

		const notes = JSON.parse(data);

		// Search for index of note with specific ID
		const noteIndex = notes.findIndex((note) => note.id === noteId);

		if (noteIndex !== -1) {
			// Remove note from array
			const deletedNote = notes.splice(noteIndex, 1)[0];

			// Re-write 'db.json' with updated array
			fs.writeFile(
				path.join(__dirname, '/db/db.json'),
				JSON.stringify(notes),
				(err) => {
					if (err) {
						console.error(err);
						return res
							.status(500)
							.json({ error: 'Internal Server Error' });
					}

					// Respond with the deleted note
					res.json(deletedNote);
				}
			);
		} else {
			// If the note with the specified ID was not found, return a 404 error
			res.status(404).json({ message: 'Note not found' });
		}
	});
});

// Will route to index.html for all other routes
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Starts Express server
app.listen(PORT, () => {
	console.log(`Server is running on port http://localhost:${PORT}`);
});
