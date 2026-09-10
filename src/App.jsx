import Approute from "./router/Approute"
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <>
      <AuthProvider>
        <Approute />
        <Toaster />
      </AuthProvider>
    </>
  )
}

export default App