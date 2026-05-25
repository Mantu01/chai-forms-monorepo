import React from 'react'
import { InputSchemaType } from '~/lib/tambo'

function Hello(val:InputSchemaType) {
  console.log({val})
  return (
    <div>{val}</div>
  )
}

export default Hello