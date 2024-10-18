import React from 'react'


const Debugger = ({data}) => {
  return (
    <pre>{JSON.stringify(data, null, 4)}</pre>
  )
}

export default Debugger