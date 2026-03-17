import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface SearchState {
  query: string
  timestamp: number // 用于触发重新搜索
}

interface SearchContextType {
  searchState: SearchState
  performSearch: (query: string) => void
}

const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    timestamp: 0,
  })

  const performSearch = useCallback((query: string) => {
    setSearchState({
      query,
      timestamp: Date.now(),
    })
  }, [])

  return (
    <SearchContext.Provider value={{ searchState, performSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchState() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearchState must be used within SearchProvider')
  }
  return context
}
