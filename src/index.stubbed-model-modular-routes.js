import bodyParser from 'body-parser';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import models from './models/index-stub';
import routes from './routes';

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

// 'modular routes' - good practice
// these MUST be decalred after the middlware stuff above else
// req.context.models is undefined in routes.<module>
app.use('/session', routes.sessionStub);
app.use('/users', routes.userStub);
app.use('/messages', routes.messageStub);

app.get('/status', (req, res) => {
  res.send('Application is running!\n');
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port: ${process.env.PORT}\n`);
});
