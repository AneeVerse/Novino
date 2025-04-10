"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ProductGrid from "@/components/product-grid"
import { useState } from "react"
import { useEffect } from "react"

export default function ShopPage() {
  // Use client-side state for category filtering
  return (
    <main className="min-h-screen bg-zinc-800 p-6 md:p-10">
      <Link href="/" className="flex items-center text-white mb-8 hover:underline">
        <ArrowLeft className="mr-2" size={16} />
        Back to Home
      </Link>

      <h1 className="text-white text-3xl md:text-4xl mb-6">Shop Our Collection</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-zinc-900 p-6 text-center">
          <h3 className="text-white text-lg mb-2">Art Prints</h3>
          <p className="text-gray-400 text-sm mb-4">Unique abstract designs to elevate your space</p>
          <span className="text-white font-bold">From $29</span>
        </div>

        <div className="bg-zinc-900 p-6 text-center">
          <h3 className="text-white text-lg mb-2">Mugs</h3>
          <p className="text-gray-400 text-sm mb-4">Artistic mugs for your morning coffee</p>
          <span className="text-white font-bold">From $15</span>
        </div>

        <div className="bg-zinc-900 p-6 text-center">
          <h3 className="text-white text-lg mb-2">Notebooks</h3>
          <p className="text-gray-400 text-sm mb-4">Stylish notebooks for your creative ideas</p>
          <span className="text-white font-bold">From $12</span>
        </div>

        <div className="bg-zinc-900 p-6 text-center">
          <h3 className="text-white text-lg mb-2">Home Decor</h3>
          <p className="text-gray-400 text-sm mb-4">Unique pieces to transform your space</p>
          <span className="text-white font-bold">From $35</span>
        </div>
      </div>

      <h2 className="text-white text-2xl mb-6">Featured Products</h2>
      <ProductGrid category="All Products" />

      <div className="mt-12">
        <h2 className="text-white text-2xl mb-6">New Arrivals</h2>
        <ProductGrid category="All Products" />
      </div>
    </main>
  )
}

