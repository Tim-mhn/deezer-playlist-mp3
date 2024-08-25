import './App.css'



import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { DeezerDownloaderPage } from './components/DeezerDownloader.page'

// Create a client
const queryClient = new QueryClient()


function App() {

  return (
    <QueryClientProvider client={queryClient}>
      
      <DeezerDownloaderPage />
    </QueryClientProvider>
  )
}

export default App
