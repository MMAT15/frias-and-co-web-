import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="max-w-xl mx-auto p-4 text-center space-y-4">
      <h1 className="text-3xl font-semibold">¡Gracias por tu compra! ✨</h1>
      <Link href="/" className="bg-accent px-4 py-2 inline-block">Seguir comprando</Link>
    </div>
  )
}
