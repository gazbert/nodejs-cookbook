import bodyParser from 'body-parser';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Logger from 'js-logger';
import models, { connectDb } from './models';
import routes from './routes';

/**
 * This version of the app uses a MongoDB backend and modular routes.
 */

// Logging stuff - need to play around with this...
const log = Logger.get('index.js');
Logger.useDefaults();
Logger.setLevel(Logger.INFO);
const consoleHandler = Logger.createDefaultHandler({
  formatter(messages, context) {
    // prefix each log message with a timestamp.
    messages.unshift(context.level.name);
    messages.unshift(new Date());
  },
});
const myHandler = function (messages, context) {
  // jQuery.post('/logs', { message: messages[0], level: context.level });
  // console.log(`Sending log message off to Kibana: ${messages[0]}`);
};
Logger.setHandler((messages, context) => {
  consoleHandler(messages, context);
  myHandler(messages, context);
});

const app = express();

// 3rd party middleware works at app level - all routes will now have cors headers
app.use(cors());

// 3rd party middleware works at app level - extracts POST body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// custom middleware applied at app level.
// This could be a pre-auth check where only auth user put in the req.me ...
app.use(async (req, res, next) => {
  req.context = {
    models,
    // hard-coded + made available for 'routes' (REST methods) later
    // would typically come a JWT in the Authorization header - another day... ;-)
    me: await models.User.findByLogin('gandalf'),
  };
  next();
});

// 'modular routes' - good practice
// these MUST be decalred after the middlware stuff above else
// req.context.models is undefined in routes.<module>
app.use('/session', routes.session);
app.use('/users', routes.user);
app.use('/messages', routes.message);

// Other stuff
app.get('/status', (req, res) => {
  log.info('js-logger: Application is running');
  res.send('Vault PoC is running!\n');
});

// In reality, this would be loaded from an external source and only done once.
const createUsersWithMessages = async () => {
  const user1 = new models.User({
    username: 'bilbobaggins',
  });

  const user2 = new models.User({
    username: 'gandalf',
  });

  const message1 = new models.Message({
    text: 'If more of us valued food and cheer and song above hoarded gold, it would be a merrier world.',
    user: user1.id,
  });

  const message2 = new models.Message({
    text: 'Fly you fools!',
    user: user2.id,
  });

  const message3 = new models.Message({
    text: 'Courage will now be your best defence against the storm that is at hand-—that and such hope as I bring.',
    user: user2.id,
  });

  await message1.save();
  await message2.save();
  await message3.save();

  await user1.save();
  await user2.save();
};

// Connect to MongoDB. Connection is asynchronous.
// Currently set to nuke exisiting database on startup and seed with new users.
const eraseDatabaseOnSync = true;
connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    await Promise.all([
      models.User.deleteMany({}),
      models.Message.deleteMany({}),
    ]);
  }
  createUsersWithMessages();

  app.listen(process.env.PORT, () =>
    log.log(`Example app listening on port ${process.env.PORT}!`));
});
