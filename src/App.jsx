import { Routes, Route, Navigate } from 'react-router-dom'
import Launchpad from './surfaces/Launchpad.jsx'
import CustomerApp from './surfaces/customer/CustomerApp.jsx'
import MyPngApp from './surfaces/mypng/MyPngApp.jsx'
import OfficerApp from './surfaces/officer/OfficerApp.jsx'

export default function App() { 
  return (
    <Routes>
      <Route path="/" element={<Launchpad />} />
      <Route path="/customer/*" element={<CustomerApp />} />
      <Route path="/mypng" element={<MyPngApp />} />
      <Route path="/officer/*" element={<OfficerApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
