import { useState } from 'react'
import { api } from '@/lib/api'
import { showToast } from '@/features/ui/uiSlice'
import { useAppDispatch } from '@/store/hooks'

const MAX_BYTES = 10 * 1024 * 1024 // matches the backend multer limit

/**
 * Uploads an image to Azure Blob via the backend and hands back the public URL.
 * Replaces the previous base64 / FileReader approach so images live in blob
 * storage rather than inside the document.
 */
export function useImageUpload() {
  const dispatch = useAppDispatch()
  const [uploading, setUploading] = useState(false)

  const uploadImage = async (
    file: File | undefined,
    onDone: (result: { url: string; publicId: string }) => void,
  ) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      dispatch(showToast('Please choose an image file'))
      return
    }
    if (file.size > MAX_BYTES) {
      dispatch(showToast('Image must be under 10MB'))
      return
    }

    setUploading(true)
    try {
      const result = await api.uploadFile(file)
      onDone(result)
    } catch (err) {
      // A 401 has already redirected to login by this point
      dispatch(showToast((err as Error).message || 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  return { uploadImage, uploading }
}
