import React, { useState } from 'react'

export default function InputBox({name , type , id , value , placeholder , icon , disable = false}) {

  const [passwordVisible , setPasswordVisible] = useState(false) ;
  return (
    <div className='relative w-[100%] mb-4'>
        <input
            name={name} 
            type={type=='password' ? passwordVisible ? "text" :"password" :"text"}
            placeholder={placeholder}
            defaultValue={value}
            id={id}
            className='input-box'
            disabled={disable}
        />
        <i className={`fi fi-rr-${icon} input-icon`}></i>

        {
          type == "password" && 
          <i 
             onClick={()=>{setPasswordVisible(currentVal=>!currentVal);}} 
             className={`fi fi-rr-${passwordVisible?"eye":"eye-crossed"} input-icon left-auto right-4 cursor-pointer`}>
          </i>
        }
    </div>
  )
}
