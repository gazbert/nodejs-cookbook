import bodyParser from 'body-parser';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Logger from 'js-logger';
import models, { connectDb } from './models';
import routes from './routes';

// // Zipkin stuff - broken #1
// const { Tracer } = require('zipkin');
// const { BatchRecorder } = require('zipkin');
// const { HttpLogger } = require('zipkin-transport-http');
// const CLSContext = require('zipkin-context-cls');
// const ctxImpl = new CLSContext();
// const recorder = new BatchRecorder({
//   logger: new HttpLogger({
//     endpoint: `http://localhost:9411/zipkin/api/v2/spans`
//   })
// });
// const tracer = new Tracer({ ctxImpl, recorder });

// Import zipkin stuff #2
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require("zipkin");
const { HttpLogger } = require("zipkin-transport-http");
const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;

const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT || "http://localhost:9411";

// Get ourselves a zipkin tracer
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
      jsonEncoder: jsonEncoder.JSON_V2,
    }),
  }),
  localServiceName: "caprica-service",
});

/********************************************************************
 * This version of the app uses a MongoDB backend and modular routes.
 ********************************************************************/

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

// Zipkin stuff #2
app.use(zipkinMiddleware({ tracer }));

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

  // // Zipkin stuff - broken #1
  // const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
  // app.use(zipkinMiddleware({
  //   tracer,
  //   serviceName: 'caprica-service' // name of this application
  // }));

  app.listen(process.env.PORT, () =>
    log.log(`Example app listening on port ${process.env.PORT}!`));
});
