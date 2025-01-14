import { fetchPlayerData, fetchAuctionData } from './hypixel.service.js';

export const getPlayerAuctions = async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`[START] Fetching auctions for username: ${username}`);

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Valid username is required' });
        }

        // Check cache first
        const cacheKey = `auctions-${username.toLowerCase()}`;
        const cachedData = req.cache.get(cacheKey);
        
        if (cachedData) {
            console.log('[CACHE] Returning cached data for', username);
            return res.json(cachedData);
        }

        // Get player UUID first
        console.log('[UUID] Fetching player UUID');
        const playerData = await fetchPlayerData(username);
        console.log('[UUID] Player data:', playerData);

        // Get auctions data
        console.log('[AUCTIONS] Fetching auctions');
        const auctions = await fetchAuctionData(playerData.id);
        console.log(`[AUCTIONS] Found ${auctions.length} auctions`);
        
        // Add username to each auction
        const auctionsWithUsername = auctions.map(auction => ({
            ...auction,
            seller_name: playerData.name
        }));
        
        // Cache the results (only if we have data)
        if (auctionsWithUsername.length > 0) {
            console.log('[CACHE] Caching auction data');
            req.cache.set(cacheKey, auctionsWithUsername, 300); // Cache for 5 minutes
        }
        
        console.log(`[COMPLETE] Returning ${auctionsWithUsername.length} auctions for ${username}`);
        res.json(auctionsWithUsername);
    } catch (error) {
        console.error('[ERROR] Error in getPlayerAuctions:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
        
        res.status(500).json({ 
            error: error.message || 'Failed to fetch auctions',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getPlayerBids = async (req, res) => {
    try {
        const { username } = req.params;
        
        // Check cache first
        const cacheKey = `bids-${username}`;
        const cachedData = req.cache.get(cacheKey);
        
        if (cachedData) {
            return res.json(cachedData);
        }

        // Get player UUID first
        const playerData = await fetchPlayerData(username);
        if (!playerData) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Get bids data
        const bids = await fetchAuctionData(playerData.uuid, true);
        
        // Cache the results
        req.cache.set(cacheKey, bids);
        
        res.json(bids);
    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ error: 'Failed to fetch bids' });
    }
};