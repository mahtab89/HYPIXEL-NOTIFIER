import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

function UsernameForm({ username, setUsername, onUsernameValidation }) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionBoxRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const debounce = (func, wait) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  const fetchSuggestions = async (value) => {
    if (value.length < 3) return

    setIsLoading(true)
    try {
      // Use our backend endpoint instead of calling Mojang directly
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/username-suggestions/${value}`)
      const data = await response.json()

      if (data.suggestions) {
        setSuggestions(data.suggestions)
        setShowSuggestions(data.suggestions.length > 0)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300)

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    
    if (value.length >= 3) {
      debouncedFetchSuggestions(value)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputValue.trim()) {
      toast.error('Please enter a username')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/check-username/${inputValue.trim()}`)
      const data = await response.json()
      
      if (data.exists) {
        setUsername(inputValue.trim())
        onUsernameValidation(true)
      } else {
        setUsername(inputValue.trim())
        onUsernameValidation(false)
      }
    } catch (error) {
      console.error('Error checking username:', error)
      toast.error('Error checking username')
      onUsernameValidation(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto relative">
      <div className="flex gap-2">
        <div className="flex-1 relative" ref={suggestionBoxRef}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter Minecraft username"
            className="w-full px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
          />
          {showSuggestions && (suggestions.length > 0 || isLoading) && (
            <div className="absolute w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
              {isLoading ? (
                <div className="px-4 py-2 text-gray-400">Loading...</div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-100"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
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