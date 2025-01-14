import axios from 'axios'

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const API_BASE_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export async function fetchPlayerAuctions(username) {
  try {
    console.log('Fetching auctions for:', username);
    const response = await api.get(`/auctions/${username}`);
    console.log('Auctions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching auctions:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      'Failed to fetch auctions'
    );
  }
}

export async function fetchPlayerBids(username) {
  try {
    const response = await api.get(`/bids/${username}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch bids')
  }
}