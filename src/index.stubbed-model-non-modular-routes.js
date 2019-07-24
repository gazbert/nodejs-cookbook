import uuidv4 from 'uuid/v4';
import bodyParser from 'body-parser';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import models from './models/index-stub';

const app = express();

// 3rd party middleware works at app level - all routes will now have cors headers.
app.use(cors());

// 3rd party middleware works at app level - extracts POST body.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// custom middleware applied at app level.
// This could be a pre-auth check where only an authenticated user is put in the req.me
// E.g. X509 certificate validation and DN extraction.
app.use((req, res, next) => {
  // context object is passed around and shared with other middleware + routes/endpoints
  // Bit like a servlet request object.
  req.context = {
    models,
    me: models.users[1],
  };
  next(); // always call next to indicate async function has completed.
});

//
// This impl has all the routes piled into the index.js - not good practice!
//
app.get('/session', (req, res) => {
  return res.send(req.context.models.users[req.context.me.id]);
});

app.get('/users', (req, res) => {
  return res.send(Object.values(req.context.models.users));
});

app.get('/users/:userId', (req, res) => {
  return res.send(req.context.models.users[req.params.userId]);
});

app.get('/messages', (req, res) => {
  return res.send(Object.values(req.context.models.messages));
});

app.get('/messages/:messageId', (req, res) => {
  return res.send(req.context.models.messages[req.params.messageId]);
});

app.post('/messages', (req, res) => {
  const id = uuidv4();
  const message = {
    id,
    text: req.body.text,
    userId: req.context.me.id, // *set in the custom middleware
  };

  req.context.models.messages[id] = message;

  return res.send(message);
});

app.delete('/messages/:messageId', (req, res) => {
  // WTF ??? Basically loops through th emessages looking for a match and returns it.
  const {
    [req.params.messageId]: message,
    ...otherMessages // spread operator = expands the array/list
  } = req.context.models.messages;

  req.context.models.messages = otherMessages;

  return res.send(message);
});

app.get('/session', (req, res) => {
  return res.send(req.context.models.users[req.me.id]);
});

app.get('/status', (req, res) => {
  res.send('Application is running!\n');
});

// Left in from initial experiments poking the app with Postman.
app.get('/', (req, res) => res.send('Received a GET HTTP method\n'));
app.post('/', (req, res) => res.send('Received a POST HTTP method\n'));
app.put('/', (req, res) => res.send('Received a PUT HTTP method\n'));
app.delete('/', (req, res) => res.send('Received a DELETE HTTP method\n'));

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port: ${process.env.PORT}\n`);
});
