import { useState } from 'react'
import './App.css'



import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()




function App() {
  const [count, setCount] = useState(0)

  return (
    <QueryClientProvider client={queryClient}>
      
      <div className='flex flex-col gap-2'>
      <h1 className='text-6xl text-slate-800'>Deezer Downloader</h1>

      <h2 className='text-2xl text-slate-600'>Download Deezer playlists to MP3</h2>

      </div>
    </QueryClientProvider>
  )
}

export default App
