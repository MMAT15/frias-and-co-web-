'use client'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const subscribe = async () => {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    if (res.ok) setSuccess(true)
  }
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-semibold">Suscribite al newsletter</h3>
      {success ? (
        <p className="text-green-500">¡Gracias por suscribirte!</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            subscribe()
          }}
          className="flex gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow px-2 py-1 text-black"
            placeholder="Tu email"
          />
          <button type="submit" className="bg-accent px-4 py-1">
            Enviar
          </button>
        </form>
      )}
    </div>
  )
}
