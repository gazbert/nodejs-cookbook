import { Router } from 'express';

/**
 * Modular route for a User.
 */
const router = Router();

/*
* Notice how we don’t need to define the /users URI (path) but only the subpaths,
  because we did this already in the mounting process of the route in the
  Express application (see src/index.js file)
 */
router.get('/', async (req, res) => {
  const users = await req.context.models.User.find();
  return res.send(users);
});

router.get('/:userId', async (req, res) => {
  const user = await req.context.models.User.findById(
    req.params.userId,
  );
  return res.send(user);
});

export default router;
