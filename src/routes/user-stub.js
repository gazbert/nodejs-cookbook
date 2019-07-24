import { Router } from 'express';

/**
 * Modular route for a stubbed User.
 */
const router = Router();

/*
* Notice how we don’t need to define the /users URI (path) but only the subpaths,
  because we did this already in the mounting process of the route in the
  Express application (see src/index.js file)
 */
router.get('/', (req, res) => {
  return res.send(Object.values(req.context.models.users));
});

router.get('/:userId', (req, res) => {
  return res.send(req.context.models.users[req.params.userId]);
});

export default router;
