import { useState } from 'react'
import toast from 'react-hot-toast'

function UsernameForm({ username, setUsername }) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) {
      toast.error('Please enter a username')
      return
    }
    setUsername(inputValue.trim())
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