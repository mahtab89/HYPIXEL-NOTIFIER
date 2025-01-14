import { useState, useEffect, useRef } from 'react'
import { fetchPlayerAuctions } from '../services/hypixelAPI'
import toast from 'react-hot-toast'
import { useClickOutside } from '../hooks/useClickOutside'
import AuctionDetailsModal from './AuctionDetailsModal'

function AuctionList({ username }) {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const filterRef = useRef()
  useClickOutside(filterRef, () => setShowFilterMenu(false))
  const [selectedAuction, setSelectedAuction] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const savedAuctions = localStorage.getItem('savedAuctions')
    const savedSearchTerm = localStorage.getItem('lastSearchTerm')
    
    if (savedAuctions && savedSearchTerm) {
      setAuctions(JSON.parse(savedAuctions))
      setSearchTerm(savedSearchTerm)
    }
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/auctions/search?player=${searchTerm}`)
      if (!response.ok) {
        throw new Error('Failed to fetch auctions')
      }
      const data = await response.json()
      setAuctions(data)
      
      localStorage.setItem('savedAuctions', JSON.stringify(data))
      localStorage.setItem('lastSearchTerm', searchTerm)
      
    } catch (err) {
      setError(err.message)
      console.error('Error fetching auctions:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAuctions = auctions.filter(auction => {
    if (filter === 'all') return true
    const isEnded = new Date(auction.end_time) < new Date()
    return filter === 'ended' ? isEnded : !isEnded
  })

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
        Error loading auctions: {error}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-lg sm:text-xl font-medium text-gray-100 break-words">
          {username}'s {filter !== 'all' ? filter : ''} Auctions ({filteredAuctions.length})
        </h2>
        
        {/* Filter Button and Dropdown */}
        <div className="relative self-end sm:self-auto z-10" ref={filterRef}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="p-2 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
            title="Filter Auctions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showFilterMenu && (
            <div className="absolute top-12 right-0 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10">
              <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                Filter Auctions
              </div>
              <button
                onClick={() => {
                  setFilter('all')
                  setShowFilterMenu(false)
                }}
                className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700"
              >
                All Auctions
              </button>
              <button
                onClick={() => {
                  setFilter('active')
                  setShowFilterMenu(false)
                }}
                className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700"
              >
                Active Auctions
              </button>
              <button
                onClick={() => {
                  setFilter('ended')
                  setShowFilterMenu(false)
                }}
                className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700"
              >
                Ended Auctions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredAuctions.length === 0 ? (
          <div className="text-center text-gray-400 col-span-full">
            No {filter !== 'all' ? filter : ''} auctions found for {username}
          </div>
        ) : (
          filteredAuctions.map((auction) => (
            <div
              key={auction.id}
              className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden hover:border-blue-500 transition-all duration-200 transform hover:-translate-y-1"
            >
              {/* Card Header - Reduced padding */}
              <div className="p-2.5 sm:p-4 border-b border-gray-700">
                <h3 className="font-semibold text-gray-100 text-sm sm:text-base truncate">
                  {auction.item_name}
                </h3>
                <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1.5">
                  {new Date(auction.end_time) < new Date() ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
                      Ended
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                      Active
                    </span>
                  )}
                  {auction.bin && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                      BIN
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body - Reduced spacing */}
              <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                {/* Current Bid */}
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-400">Current Bid</span>
                  <span className="text-xs sm:text-sm text-gray-100 font-medium">
                    {auction.current_bid.toLocaleString()} coins
                  </span>
                </div>

                {/* Starting Bid */}
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-400">Starting Bid</span>
                  <span className="text-xs sm:text-sm text-gray-100 font-medium">
                    {auction.starting_bid.toLocaleString()} coins
                  </span>
                </div>

                {/* End Time - Compact format for mobile */}
                <div className="pt-2 sm:pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-400">Ends at</span>
                    <span className="text-xs sm:text-sm text-gray-200 font-medium">
                      {new Date(auction.end_time).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer - Reduced padding */}
              <div className="px-2.5 py-2 sm:px-4 sm:py-3 bg-gray-850 border-t border-gray-700">
                <button 
                  onClick={() => setSelectedAuction(auction)}
                  className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedAuction && (
        <AuctionDetailsModal
          auction={selectedAuction}
          onClose={() => setSelectedAuction(null)}
        />
      )}
    </div>
  )
}

export default AuctionList