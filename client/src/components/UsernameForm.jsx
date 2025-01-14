import { useState } from 'react'
import toast from 'react-hot-toast'

function UsernameForm({ username, setUsername, onUsernameValidation }) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // First validate that there is input
    if (!inputValue.trim()) {
      toast.error('Please enter a username')
      return
    }

    try {
      // Use the complete backend URL
      const response = await fetch(`https://hypixel-notifier-backend.onrender.com/api/check-username/${inputValue.trim()}`)
      const data = await response.json()
      
      if (data.exists) {
        setUsername(inputValue.trim()) // Only set username if it exists
        onUsernameValidation(true)
      } else {
        setUsername(inputValue.trim())
        onUsernameValidation(false)
      }
    } catch (error) {
      toast.error('Error checking username')
      onUsernameValidation(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter Minecraft username"
          className="flex-1 min-w-0 px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default UsernameForm