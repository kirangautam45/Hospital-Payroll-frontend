import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Lookup } from './pages/Lookup'
import { Analytics } from './pages/Analytics'
import { Reports } from './pages/Reports'
import { AddUser } from './pages/AddUser'
import Pharmacy from './pages/Pharmacy'

function App() {
  return (
    <BrowserRouter>
      <Toaster position='top-right' richColors />
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<AddUser />} />

        {/* Protected Routes (wrapping all private pages) */}
        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<Dashboard />} />
          <Route path='/lookup' element={<Lookup />} />
          <Route path='/analytics' element={<Analytics />} />
          <Route path='/reports' element={<Reports />} />
          <Route path='/add-user' element={<AddUser />} />
          <Route path='/pharmacy' element={<Pharmacy />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
