import { useState } from 'react'
import './App.css'
import Popup from './popup/Popup'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Popup />
    </>
  )
}

export default App
