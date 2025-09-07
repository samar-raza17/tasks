import express from 'express';
import mongoose from 'mongoose';
import { Task } from '../models/Task.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    let { limit = 10, cursorId, cursorDate, status, title } = req.query;
    limit = parseInt(limit);
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({ error: 'Invalid limit (1-50)' });
    }

    const statuses = ['todo', 'doing', 'done'];
    if (status && !statuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status, must be one of: ${statuses.join(', ')}` });
    }

    const filter = {};
    if (status) filter.status = status;

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (cursorId && cursorDate) {
      if (!mongoose.Types.ObjectId.isValid(cursorId)) {
        return res.status(400).json({ error: 'Invalid cursorId' });
      }
      filter.$or = [
        { createdAt: { $lt: new Date(cursorDate) } },
        {
          createdAt: new Date(cursorDate),
          _id: { $lt: cursorId },
        },
      ];
    }

    const items = await Task.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .select('title status priority createdAt')
      .exec();

    let nextCursor = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = {
        cursorId: nextItem._id,
        cursorDate: nextItem.createdAt,
      };
    }

    res.json({ items, nextCursor });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, status, priority } = req.body;

    if (!title || !status || !['todo', 'doing', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const task = new Task({
      title,
      status,
      priority
    });

    const saved = await task.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});


export default router;
