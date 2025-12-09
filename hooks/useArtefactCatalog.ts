"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

type CatalogProduct = {
  id: string
  name: string
  basePrice?: string
  price?: string
  images?: string[]
  image?: string
  category: string
  categoryId?: string
  categorySlug?: string
  type?: string
  slug?: string
  createdAt?: string
}

type CatalogCategory = {
  _id?: string
  id?: string
  name: string
  description?: string
  order?: number
  products?: CatalogProduct[]
  type?: string
  slug?: string
  createdAt?: string
  updatedAt?: string
}

const CACHE_TTL = 1000 * 30 // 30 seconds - short TTL to reflect order changes quickly

let cachedCatalog: CatalogCategory[] | null = null
let cachedAt = 0
let inflightPromise: Promise<CatalogCategory[]> | null = null

function sortCatalogCategories(categories: CatalogCategory[]) {
  return [...categories].sort((a, b) => {
    const orderA =
      typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER
    const orderB =
      typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER

    if (orderA === orderB) {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Infinity
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Infinity
      return dateA - dateB
    }

    return orderA - orderB
  })
}

async function fetchCatalog(): Promise<CatalogCategory[]> {
  const response = await fetch("/api/artefact-categories", {
    cache: "no-store", // Don't cache to ensure fresh order data
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? sortCatalogCategories(data) : []
}

function mapProducts(categories: CatalogCategory[]) {
  const allProducts = categories.flatMap((category) => {
    if (!Array.isArray(category.products)) {
      return []
    }

    return category.products.map((product) => {
      const id =
        product.id?.toString() ||
        (product as any)?._id?.toString() ||
        `${category._id || category.id}-${product.name}`
      const primaryImage =
        (Array.isArray(product.images) && product.images[0]) ||
        product.image ||
        "/images/placeholder.png"
      const imageSet =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : product.image
            ? [product.image]
            : [primaryImage]

      return {
        id,
        name: product.name ?? "Untitled Product",
        price: product.basePrice ?? product.price,
        basePrice: product.basePrice ?? product.price,
        image: primaryImage,
        images: imageSet,
        category: category.name,
        categoryId: category._id?.toString() ?? category.id?.toString(),
        categorySlug: category.slug,
        type: product.type ?? category.type,
        slug: product.slug,
        createdAt: product.createdAt
      }
    })
  })

  return allProducts
}

function deriveCategoryOptions(
  categories: CatalogCategory[],
  predicate?: (name: string) => boolean,
  emptyFallbackLabel = "All Products"
) {
  const filtered = categories
    .map((category) => category.name)
    .filter((name) => (predicate ? predicate(name.toLowerCase()) : true))

  if (filtered.length === 0) {
    return [emptyFallbackLabel]
  }

  const uniqueNames = Array.from(new Set(filtered))
  return [emptyFallbackLabel, ...uniqueNames]
}

export function useArtefactCatalog(options?: { refresh?: boolean }) {
  const [catalog, setCatalog] = useState<CatalogCategory[]>(
    cachedCatalog ?? []
  )
  const [loading, setLoading] = useState(() => !cachedCatalog)
  const [error, setError] = useState<string | null>(null)

  const shouldRefresh =
    options?.refresh ||
    !cachedCatalog ||
    Date.now() - cachedAt > CACHE_TTL

  const resolveCatalog = useCallback(async () => {
    if (!shouldRefresh && cachedCatalog) {
      setCatalog(cachedCatalog)
      setLoading(false)
      return
    }

    if (!inflightPromise) {
      inflightPromise = fetchCatalog()
        .then((data) => {
          cachedCatalog = data
          cachedAt = Date.now()
          return data
        })
        .finally(() => {
          inflightPromise = null
        })
    }

    try {
      setLoading(true)
      const data = await inflightPromise
      setCatalog(data)
      setError(null)
    } catch (err: any) {
      console.error("Error loading artefact catalog:", err)
      setError(err.message ?? "Failed to load catalog")
    } finally {
      setLoading(false)
    }
  }, [shouldRefresh])

  useEffect(() => {
    resolveCatalog()
  }, [resolveCatalog])

  const allProducts = useMemo(() => mapProducts(catalog), [catalog])

  const paintingProducts = useMemo(() => {
    return allProducts.filter((product) =>
      product.category?.toLowerCase().includes("painting")
    )
  }, [allProducts])

  const artefactProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const categoryName = product.category?.toLowerCase() ?? ""
      return !categoryName.includes("painting")
    })
  }, [allProducts])

  const categoryOptions = useMemo(
    () => deriveCategoryOptions(catalog),
    [catalog]
  )

  const paintingCategoryOptions = useMemo(
    () =>
      deriveCategoryOptions(
        catalog,
        (name) => name.includes("painting"),
        "All Paintings"
      ),
    [catalog]
  )

  const artefactCategoryOptions = useMemo(
    () =>
      deriveCategoryOptions(
        catalog,
        (name) => !name.includes("painting"),
        "All Products"
      ),
    [catalog]
  )

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    catalog.forEach((category) => {
      const key = category._id?.toString() ?? category.id?.toString()
      if (key) {
        map[key] = category.name
      }
    })
    return map
  }, [catalog])

  return {
    catalog,
    products: allProducts,
    paintingProducts,
    artefactProducts,
    categoryOptions,
    paintingCategoryOptions,
    artefactCategoryOptions,
    categoryMap,
    loading,
    error,
    refresh: resolveCatalog
  }
}

