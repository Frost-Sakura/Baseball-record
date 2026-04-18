import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { Dashboard } from './components/dashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/games" element={<div style={{ padding: 'var(--space-xl)' }}><h1>賽事紀錄頁面</h1><p>開發中...</p></div>} />
            <Route path="/teams" element={<div style={{ padding: 'var(--space-xl)' }}><h1>球隊/球員管理</h1><p>開發中...</p></div>} />
            <Route path="/settings" element={<div style={{ padding: 'var(--space-xl)' }}><h1>設定頁面</h1><p>開發中...</p></div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
