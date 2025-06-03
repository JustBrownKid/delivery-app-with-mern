import React from 'react'
import {useState , useRef } from 'react'

const AWBTemplate = () => {
  const [tracking , setTracking] = useState('')
  const [toggel , setToggel] = useState(false)
  const [loading , setLoading] = useState(false)
  const [rts , setRts] = useState(false)
  const inputRef = useRef(null); 

  const trackingSet = (e) => {
    e.preventDefault(); 
    const value = e.target.value
   
    if(value.length  === 25){
       setTracking(value)
        
        if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }
  return (
    <div>
      <h1>{tracking}</h1>
    <input type="text"  ref={inputRef}  onChange={trackingSet}  placeholder='Enter Tracking Id'/>
    </div>
  )
}

export default AWBTemplate