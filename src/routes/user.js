import { Router } from 'express';
// const rp = require('request-promise-native');

// Zipkin stuff
// const {wrapRequest} = require('zipkin-instrumentation-request-promise');
// const ctxImpl = new ExplicitContext();
// const recorder = new ConsoleRecorder();
// const localServiceName = 'caprica-service'; // name of this application
// const tracer = new Tracer({ctxImpl, recorder, localServiceName});
// const remoteServiceName = 'geminon-service';
// const rp = wrapRequest(tracer, remoteServiceName);

// Import zipkin stuff #2
// const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require("zipkin");
// const { HttpLogger } = require("zipkin-transport-http");
const { wrapRequest } = require('zipkin-instrumentation-request-promise');

// const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT || "http://localhost:9411";

// Use the Tracer set up once in the main index.js?
// Get ourselves a zipkin tracer
// const tracer = new Tracer({
//   ctxImpl: new ExplicitContext(),
//   recorder: new BatchRecorder({
//     logger: new HttpLogger({
//       endpoint: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
//       jsonEncoder: jsonEncoder.JSON_V2,
//     }),
//   }),
//   localServiceName: "caprica-service",
// });

const remoteServiceName = 'geminon-service';

/**
 * Modular route for a User.
 */
const router = Router();

function callAnotherServiceToTestZipkin(tracer) {
  const rp = wrapRequest(tracer, remoteServiceName); // Move so rp only gets created once!
  const options = {
    uri: 'http://localhost:3200/messages',
    qs: {
        access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
    },
    headers: {
        'User-Agent': 'Mish-Mash'
    },
    json: true // Automatically parses the JSON string in the response
  };

  rp(options)
    .then(function (response) {
        console.log('/messages response:', response);
        return response;
    })
    .catch(function (err) {
        // API call failed...
        console.log('/messages Call failed', err.message);
    });
}

/*
* Notice how we don’t need to define the /users URI (path) but only the subpaths,
  because we did this already in the mounting process of the route in the
  Express application (see src/index.js file)
 */
router.get('/', async (req, res) => {
  const users = await req.context.models.User.find();
  callAnotherServiceToTestZipkin(req.context.tracer);
  return res.send(users);
});

router.get('/:userId', async (req, res) => {
  const user = await req.context.models.User.findById(
    req.params.userId,
  );
  return res.send(user);
});

export default router;
