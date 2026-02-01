import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { packageApi } from '../../services/api'
import type { Package } from '../../types'

interface PackageFormProps {
  packageData?: Package | null
  onClose: () => void
  onSuccess: () => void
}

export default function PackageForm({ packageData, onClose, onSuccess }: PackageFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    duration: '',
    price: '',
    originalPrice: '',
    maxTravelers: '',
    minTravelers: '1',
    includes: '',
    excludes: '',
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (packageData) {
      setFormData({
        title: packageData.title || '',
        destination: packageData.destination || '',
        description: packageData.description || '',
        duration: packageData.duration?.toString() || '',
        price: packageData.price?.toString() || '',
        originalPrice: packageData.originalPrice?.toString() || '',
        maxTravelers: packageData.maxTravelers?.toString() || '',
        minTravelers: packageData.minTravelers?.toString() || '1',
        includes: packageData.includes?.join(', ') || '',
        excludes: packageData.excludes?.join(', ') || '',
      })
      if (packageData.images && packageData.images.length > 0) {
        setExistingImages(packageData.images)
      }
    }
  }, [packageData])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file sizes (max 5MB per image)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`Image ${file.name} is too large. Max size is 5MB.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Limit to 5 images total
    const totalImages = imageFiles.length + validFiles.length
    if (totalImages > 5) {
      setError('Maximum 5 images allowed')
      return
    }

    const newFiles = [...imageFiles, ...validFiles]
    setImageFiles(newFiles)

    // Create previews
    const newPreviews: string[] = []
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === newFiles.length) {
          setImagePreviews(newPreviews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Max dimensions
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 800
          
          let width = img.width
          let height = img.height
          
          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height
              height = MAX_HEIGHT
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Convert to base64 with compression (quality: 0.7 = 70%)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
          resolve(compressedBase64)
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    // For images, use compression
    if (file.type.startsWith('image/')) {
      return compressImage(file)
    }
    
    // For non-images, just convert
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Convert image files to base64 URLs
      const imageUrls: string[] = [...existingImages]
      
      for (const file of imageFiles) {
        try {
          const base64 = await convertFileToBase64(file)
          imageUrls.push(base64)
        } catch (err) {
          console.error('Error converting image:', err)
        }
      }

      if (imageUrls.length === 0) {
        setError('Please add at least one image')
        setLoading(false)
        return
      }

      const data = {
        ...formData,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        maxTravelers: parseInt(formData.maxTravelers),
        minTravelers: parseInt(formData.minTravelers),
        includes: formData.includes.split(',').map((s) => s.trim()).filter(Boolean),
        excludes: formData.excludes.split(',').map((s) => s.trim()).filter(Boolean),
        images: imageUrls,
      }

      let response
      if (packageData) {
        response = await packageApi.update(packageData.id, data)
      } else {
        response = await packageApi.create(data)
      }

      if (response.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.error?.message || 'Failed to save package')
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-[#566614] text-white p-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
              {packageData ? 'Edit Package' : 'Create New Package'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination *
                </label>
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Travelers *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maxTravelers}
                  onChange={(e) => setFormData({ ...formData, maxTravelers: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Includes (comma-separated)
              </label>
              <input
                type="text"
                value={formData.includes}
                onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                placeholder="e.g., Hotel, Meals, Transportation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excludes (comma-separated)
              </label>
              <input
                type="text"
                value={formData.excludes}
                onChange={(e) => setFormData({ ...formData, excludes: e.target.value })}
                placeholder="e.g., Airfare, Personal expenses"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#566614]"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images * (Max 5 images)
              </label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={existingImages.length + imageFiles.length >= 5}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md hover:border-[#566614] hover:bg-[#FFFAC3]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-gray-600">
                  {existingImages.length + imageFiles.length >= 5
                    ? 'Maximum 5 images reached'
                    : 'Click to add images from your computer'}
                </span>
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF. Maximum 5 images.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (existingImages.length === 0 && imageFiles.length === 0)}
                className="px-6 py-2 bg-[#566614] text-white rounded-md hover:bg-[#6E6B40] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : packageData ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
