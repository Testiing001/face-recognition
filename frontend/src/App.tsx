import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/homePage'
import { AdminLogin } from './pages/adminLogin'
import { AdminPage } from './pages/adminPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <>
      <ToastContainer autoClose={1500}/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/adminpage" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
