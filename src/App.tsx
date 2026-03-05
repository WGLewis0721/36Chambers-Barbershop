import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Book from './pages/Book'
import Confirm from './pages/Confirm'
import ManageBooking from './pages/ManageBooking'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to="/book" replace />} />
        <Route path="/book" element={<Book />} />
        <Route path="/confirm/:id" element={<Confirm />} />
        <Route path="/manage/:id" element={<ManageBooking />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
