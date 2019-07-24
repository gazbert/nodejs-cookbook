# Node.js Cookbook

## What is this?
A cookbook for getting started with node.js development fast!

If you're a Java developer and want to start developing with node.js, you've come to the right place... maybe. ;-)

## Usage
There are 3 versions of the app that can be run:

1. `npm run start-stub-nonmod` - Run Express app with stubbed model and non-modular routes.
1. `npm run start-stub-mod` - Runs Express app with stubbed model and modular routes. 
1. `npm start` - Runs Express app with MongoDB backed model and modular routes.

Call the endpoints, e.g.

* `http://localhost:3000/users/1`
* `http://localhost:3000/messages/1`

## How does stuff work?
### npm versioning

Node Package Manager is used to manage node.js dependencies. A bit like Maven and Gradle.

The `package.json` contains the project's dependency info.

npm uses [semantic versioning](https://docs.npmjs.com/about-semantic-versioning) for dependency management:

* ~1.0.4 - only take patch updates.
* ^1.0.4 - only take minor updates (+ patch updates).

Run `npm install` to install _all_ the dependencies in `package.json` - do after checking out of Git.

Run `npm outdated` then `npm update` and to check if we're up to date.

`npm install express --save` - installs and updates prod deps in `package.json`.

`npm install jest --save` - installs and updates dev deps `package.json`.

### Nodemon
Runs the app in the background when you're developing, so that changes to the code are reflected immediately.

`npm install nodemon --save-dev`

Update `pacakge.json` script:
```
  "scripts": {
    "start": "nodemon src/index.js",
```

### Babel
Used to transpile latest JavaScript into simpler JS for node.js engine to execute. Allows developers to use latest ECMAScript features and run them on node.js.

`npm install @babel/core @babel/node --save-dev`

Update your `pacakge.json` scripts start line with:
```
"scripts": {
    "start": "nodemon --exec babel-node src/index.js",
```

Next, you need to tell which features (presets) of ECMAScript to use:

`npm install @babel/preset-env --save-dev`

Create a .babelrc file in project root and add:
```
  "presets": [
    "@babel/preset-env"
  ]
}
```

### Express
A very popular HTTP server for node.js. Excellent support for creating REST endpoints. Bit like Spring REST Coontrollers.

##### Routes
Essentially a REST endpoint.
```
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});
```
#### Middleware
Bit like servlet filters in the Java world.

##### Application-level middleware
Can be 3rd party libs or custom impl. Applied at the application level.

For example, to allow [CORS](https://www.robinwieruch.de/node-js-express-tutorial/) for entire app (adds CORS header). Instead of adding it for every route, it can be done once at the app level.

`npm install cors`

```
import cors from 'cors';

const app = express();

app.use(cors());
```

Another example is well-known middleware for parsing HTTP POST requests into JSON:

`npm install body-parser`

```
import bodyParser from 'body-parser';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

```

##### Router-level middleware
Runs only for a specific route.

TODO: Include example.

### Evnironment Variables
Use dotenv to access them. Store your env vars in a `.env` file in project root folder.

`npm install dotenv`

```
import 'dotenv/config';

console.log(`Example app listening on port ${process.env.PORT}!`),
```

### MongoDB
The app uses [MongoDB](https://www.mongodb.com/) for the database.

* How to install MongoDB on Debian: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/
* How to install MongoDB on MacOS: https://www.robinwieruch.de/mongodb-macos-setup/

### Mongoose
The app uses [Mongoose](https://mongoosejs.com/) for ORM (Onject Relation Mapping) mapping layer.

`npm install mongoose --save`

It maps a JavaScript object [model](./src/models/user.js) to a MongoDB schema. The model can then be used by the routes to fetch users, delete messages, etc.

## REST API test tools

### Curl
Use [curl](https://curl.haxx.se/) on the linux command line. Responses can be piped into Bash [jq](https://linuxhint.com/bash_jq_command/) for formatting.

Example curl requests:

`curl http://localhost:3000/messages | jq; # defaults to GET`

`curl -X DELETE http://localhost:3000/messages/msg_123`

``` json
curl -X POST -H "Content-Type:application/json" http://localhost:3000/messages -d '{"text":"Hi again, World"}'
```

## Postman
Use [Postman](https://www.getpostman.com/).

## Useful VS Code Extensions

[VS Code](https://code.visualstudio.com/) is a decent free IDE for JavaScript development. Some useful extensions include:

1. DotEnv
1. ESLint
1. Prettier
1. GitLens
1. Jest vs Jest Runner - which is best?
1. Docker
1. TODO Tree
1. HCL (HashiCorp Language support for Vault config)

## References
1. https://www.robinwieruch.de/minimal-node-js-babel-setup - a great series of tutorials for getting started with node.js, express, and MongoDB integration.