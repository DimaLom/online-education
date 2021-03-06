const express = require('express');
const config = require('config');
const mongoose = require('mongoose');

const app = express();

app.use(express.json({ extended: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/group', require('./routes/group.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/user_groups', require('./routes/user_groups.routes'));
app.use('/api/training', require('./routes/training.routes'));
app.use('/api/subject', require('./routes/subject.routes'));

const PORT = config.get('port') || 5000;

async function start() {
	try {
		await mongoose.connect(config.get('mongoUri'), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		app.listen(PORT, () =>
			console.log(`App has been started on port ${PORT}...`),
		);
	} catch (e) {
		console.log('Server Error', e.message);
		process.exit(1);
	}
}

start();
