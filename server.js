const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

// Handling uncaught exceptions
// NEEDS TO BE AT THE TOP BEFORE ANY OTHER CODE STARTS EXECUTION

process.on('uncaughtException', (error) => {
  console.log('UNHANDLED REJECTION! Shutting Down! 💥');
  console.log(error.name, error.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection successful!');
  });

const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// handling unhandled rejected promises

process.on('unhandledRejection', (error) => {
  console.log('UNHANDLED REJECTION! Shutting Down! 💥');
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});
