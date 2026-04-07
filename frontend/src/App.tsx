import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/homePage'
import { AdminLogin } from './pages/adminLogin'
import { AdminPage } from './pages/adminPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/adminpage" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
