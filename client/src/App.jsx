import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import UsernameForm from './components/UsernameForm'
import AuctionList from './components/AuctionList'
import BidsList from './components/BidsList'
import Footer from './components/Footer'

function App() {
  const [username, setUsername] = useState('')
  const [activeTab, setActiveTab] = useState('auctions')
  const [usernameExists, setUsernameExists] = useState(true)

  const handleUsernameValidation = (exists) => {
    setUsernameExists(exists)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#374151',
            color: '#fff',
          },
        }}
      />
      <div className="w-full flex-1 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-3 py-6 sm:px-4 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-8 text-blue-400">
            Hypixel Auction Notifier
          </h1>
          
          <UsernameForm 
            username={username} 
            setUsername={setUsername}
            onUsernameValidation={handleUsernameValidation}
          />

          {username && !usernameExists && (
            <div className="mt-4 text-center text-red-400">
              This username does not exist
            </div>
          )}

          {username && usernameExists && (
            <div className="mt-8">
              <div className="flex gap-2 sm:gap-4 mb-4 overflow-x-auto">
                <button
                  className={`px-3 sm:px-4 py-2 rounded transition-colors whitespace-nowrap ${
                    activeTab === 'auctions'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveTab('auctions')}
                >
                  My Auctions
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 rounded transition-colors whitespace-nowrap ${
                    activeTab === 'bids'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveTab('bids')}
                >
                  My Bids
                </button>
              </div>

              {activeTab === 'auctions' ? (
                <AuctionList username={username} />
              ) : (
                <BidsList username={username} />
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App