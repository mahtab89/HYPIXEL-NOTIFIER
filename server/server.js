import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { router } from './auction.routes.js';

dotenv.config();

const app = express();
const cache = new NodeCache({ stdTTL: 60 });

// Update CORS configuration
const corsOptions = {
  origin: [
    'https://hypixel-notifier-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS with options
app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Add cache middleware
app.use((req, res, next) => {
  req.cache = cache;
  next();
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', router);

// Add this new endpoint
app.get('/api/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Add cache check
    const cacheKey = `username-${username}`;
    const cachedResult = req.cache.get(cacheKey);
    if (cachedResult !== undefined) {
      return res.json({ exists: cachedResult });
    }

    // First check if username exists in Mojang
    const mojangResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    
    if (!mojangResponse.ok) {
      req.cache.set(cacheKey, false);
      return res.json({ exists: false });
    }

    const mojangData = await mojangResponse.json();
    
    if (!mojangData || !mojangData.id) {
      req.cache.set(cacheKey, false);
      return res.json({ exists: false });
    }

    try {
      // Check if player exists in Hypixel
      const hypixelResponse = await fetch(
        `https://api.hypixel.net/player?key=${process.env.HYPIXEL_API_KEY}&uuid=${mojangData.id}`
      );
      
      if (!hypixelResponse.ok) {
        // If Hypixel API fails, consider the user valid if they exist in Mojang
        console.warn('Hypixel API check failed, falling back to Mojang validation');
        req.cache.set(cacheKey, true);
        return res.json({ exists: true });
      }

      const hypixelData = await hypixelResponse.json();
      
      // Consider the player exists if:
      // 1. The API call was successful AND
      // 2. Either the player data exists OR we got a success response
      const exists = hypixelData.success && (hypixelData.player !== null || true);
      
      req.cache.set(cacheKey, exists);
      res.json({ exists });
    } catch (hypixelError) {
      // If Hypixel check fails, consider the user valid if they exist in Mojang
      console.warn('Hypixel API check failed:', hypixelError);
      req.cache.set(cacheKey, true);
      res.json({ exists: true });
    }
  } catch (error) {
    console.error('Error checking username:', error);
    // In case of any error, try to be lenient and allow the username
    res.json({ exists: true });
  }
});

// Add this new endpoint for username suggestions
app.get('/api/username-suggestions/:username', async (req, res) => {
  const { username } = req.params;
  
  res.header('Access-Control-Allow-Origin', 'https://hypixel-notifier-frontend.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    // Handle special characters like underscore
    const searchParts = username.split('_');
    let suggestions = new Set();

    // Try exact match first
    const exactResponse = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if (exactResponse.ok) {
      const exactData = await exactResponse.json();
      suggestions.add(exactData.name);
    }

    // Generate search patterns based on parts
    const searchPatterns = [];
    if (searchParts.length > 1) {
      // Add full username
      searchPatterns.push(username);
      // Add first part
      searchPatterns.push(searchParts[0]);
      // Add combinations with underscore
      searchPatterns.push(`${searchParts[0]}_`);
      if (searchParts[1]) {
        // Add second part
        searchPatterns.push(searchParts[1]);
        // Add partial combinations
        searchPatterns.push(`${searchParts[0]}_${searchParts[1]}`);
      }
    } else {
      // Single word username
      searchPatterns.push(username);
      searchPatterns.push(`${username}_`);
      searchPatterns.push(`_${username}`);
    }

    // Add common variations
    searchPatterns.push(...[
      username,
      `${username}1`,
      `${username}2`,
      `${username}_mc`,
      `mc_${username}`,
      `${username}_yt`,
    ]);

    // Remove duplicates and empty patterns
    const uniquePatterns = [...new Set(searchPatterns.filter(p => p.trim()))];

    // Search for each pattern
    const searchPromises = uniquePatterns.map(pattern =>
      fetch('https://api.mojang.com/profiles/minecraft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([pattern])
      }).then(r => r.ok ? r.json() : [])
        .catch(() => [])
    );

    const results = await Promise.all(searchPromises);
    
    // Combine all results and filter
    results.flat().forEach(player => {
      if (player && player.name) {
        const playerName = player.name.toLowerCase();
        const searchLower = username.toLowerCase();
        
        // Add to suggestions if:
        // 1. It's an exact match
        // 2. It contains the search term
        // 3. It contains all parts of the search term (for underscore searches)
        if (playerName === searchLower ||
            playerName.includes(searchLower) ||
            searchParts.every(part => playerName.includes(part.toLowerCase()))) {
          suggestions.add(player.name);
        }
      }
    });

    // Convert Set to Array and sort
    const sortedSuggestions = [...suggestions].sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const searchLower = username.toLowerCase();

      // Exact matches first
      if (aLower === searchLower) return -1;
      if (bLower === searchLower) return 1;

      // Then matches that start with the search term
      if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1;
      if (!aLower.startsWith(searchLower) && bLower.startsWith(searchLower)) return 1;

      // Then by length (shorter names first)
      if (a.length !== b.length) return a.length - b.length;

      // Finally alphabetically
      return aLower.localeCompare(bLower);
    });

    res.json({ suggestions: sortedSuggestions.slice(0, 5) });
  } catch (error) {
    console.error('Error fetching username suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', corsOptions.origin);
});