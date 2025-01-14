import React from 'react';

function AuctionDetailsModal({ auction, onClose }) {
  if (!auction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-100">{auction.item_name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {new Date(auction.end_time) < new Date() ? (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">
                Ended
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                Active
              </span>
            )}
            {auction.bin && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                Buy It Now
              </span>
            )}
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-300">
              {auction.tier}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {/* Bid Information */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Bid</span>
              <span className="text-gray-100 font-medium">
                {auction.current_bid.toLocaleString()} coins
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Starting Bid</span>
              <span className="text-gray-100 font-medium">
                {auction.starting_bid.toLocaleString()} coins
              </span>
            </div>
          </div>

          {/* Time Information */}
          <div className="pt-3 border-t border-gray-700">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">End Time</span>
                <span className="text-gray-100">
                  {new Date(auction.end_time).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Item Details */}
          {auction.item_lore && (
            <div className="pt-3 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Item Description</h4>
              <div 
                className="text-sm text-gray-400 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: auction.item_lore }}
              />
            </div>
          )}

          {/* Category Information */}
          <div className="pt-3 border-t border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-400">Category</span>
              <span className="text-gray-100 capitalize">{auction.category}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-700">
          {!auction.ended && (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailsModal; 