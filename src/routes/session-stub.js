import { Router } from 'express';

/**
 * Modular route for a stub Session.
 */
const router = Router();

router.get('/', (req, res) => {
  return res.send(req.context.models.users[req.context.me.id]);
});

export default router;
