import { useState, useEffect } from 'react'
import { fetchPlayerBids } from '../services/hypixelAPI'
import toast from 'react-hot-toast'

function BidsList({ username }) {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadBids = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPlayerBids(username)
        setBids(data)
      } catch (error) {
        setError(error.message)
        toast.error('Failed to load bids')
      } finally {
        setLoading(false)
      }
    }

    loadBids()
  }, [username])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Error loading bids: {error}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {bids.length === 0 ? (
        <div className="text-center text-gray-400">No bids found</div>
      ) : (
        bids.map((bid) => (
          <div
            key={bid.id}
            className="bg-gray-800 p-4 rounded shadow border border-gray-700"
          >
            <h3 className="font-bold text-gray-100">{bid.item_name}</h3>
            <p className="text-gray-400">Your Bid: {bid.amount.toLocaleString()} coins</p>
            <p className="text-gray-400">Status: {bid.status}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default BidsList