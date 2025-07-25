'use client'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

export default function ContactPage() {
  const center = { lat: -34.763, lng: -58.213 }
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-semibold">Contacto</h1>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_MAPS_KEY || ''}>
        <GoogleMap center={center} zoom={15} mapContainerStyle={{ height: '300px', width: '100%' }}>
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
      <form action="https://formspree.io/f/mayvlqjg" method="POST" className="space-y-2">
        <input type="text" name="name" required placeholder="Nombre" className="w-full px-2 py-1 text-black" />
        <input type="email" name="email" required placeholder="Email" className="w-full px-2 py-1 text-black" />
        <textarea name="message" required placeholder="Mensaje" className="w-full px-2 py-1 text-black" />
        <button type="submit" className="bg-accent px-4 py-2">Enviar</button>
      </form>
    </div>
  )
}
