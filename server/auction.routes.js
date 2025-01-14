import express from 'express';
import { getPlayerAuctions, getPlayerBids } from './auction.controller.js';

const router = express.Router();

router.get('/auctions/:username', getPlayerAuctions);
router.get('/bids/:username', getPlayerBids);

export { router };