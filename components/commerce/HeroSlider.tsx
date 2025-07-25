'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import products from '@/lib/products'
import Image from 'next/image'

export default function HeroSlider() {
  return (
    <Swiper autoplay className="h-screen">
      {products.slice(0, 3).map((p) => (
        <SwiperSlide key={p.id} className="relative">
          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <h2 className="text-4xl font-semibold">Bienvenid@ a BERA Clothing</h2>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
