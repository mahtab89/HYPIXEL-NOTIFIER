import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HYPIXEL_API_KEY = process.env.HYPIXEL_API_KEY;
const MOJANG_API = 'https://api.mojang.com/users/profiles/minecraft';
const HYPIXEL_API = 'https://api.hypixel.net';

export const fetchPlayerData = async (username) => {
    try {
        console.log(`Fetching UUID for username: ${username}`);
        if (!username || typeof username !== 'string') {
            throw new Error('Invalid username');
        }

        const response = await axios.get(`${MOJANG_API}/${encodeURIComponent(username)}`);
        console.log('Mojang API Response:', response.data);
        
        if (!response.data || !response.data.id) {
            throw new Error('Invalid response from Mojang API');
        }

        return {
            id: response.data.id,
            name: response.data.name
        };
    } catch (error) {
        console.error('Error fetching player data:', error);
        throw error;
    }
};

export const fetchAuctionData = async (uuid) => {
    try {
        console.log(`Fetching auctions for UUID: ${uuid}`);
        
        // Fetch player's auctions directly
        const response = await axios.get(`${HYPIXEL_API}/skyblock/auction`, {
            headers: {
                'API-Key': HYPIXEL_API_KEY
            },
            params: {
                player: uuid  // This will fetch only the player's auctions
            }
        });

        if (!response.data?.success) {
            throw new Error(`Hypixel API Error: ${response.data?.cause || 'Unknown error'}`);
        }

        const auctions = response.data.auctions || [];
        console.log(`Found ${auctions.length} auctions for player`);

        return auctions.map(auction => ({
            id: auction.uuid || '',
            item_name: auction.item_name || 'Unknown Item',
            current_bid: auction.highest_bid_amount || 0,
            end_time: auction.end || Date.now(),
            status: auction.claimed ? 'ended' : 'active',
            starting_bid: auction.starting_bid || 0,
            seller_uuid: auction.auctioneer || '',
            seller_name: auction.auctioneer_name || '',
            tier: auction.tier || 'COMMON',
            category: auction.category || 'unknown',
            bin: auction.bin || false,
            item_lore: auction.item_lore || '',
        }));
    } catch (error) {
        console.error('Error fetching auction data:', error);
        throw error;
    }
};