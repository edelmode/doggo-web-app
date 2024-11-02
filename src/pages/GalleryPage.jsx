import React from 'react'
import Navbar from '../components/Navbar'
import Gallery from '../components/Gallery'

export default function GalleryPage() {
  return (
    <div className="font-montserrat overflow-auto">
        <Navbar />
        <Gallery />
    </div>
  )
}
