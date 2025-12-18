import { useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Image, Upload, Trash2, Copy, ExternalLink, Search, Grid, List,
  FileImage, Download, Eye, X, CheckCircle, Loader2, ImagePlus,
  HardDrive, Calendar, Maximize2
} from 'lucide-react'
import { adminAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminMedia() {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  
  const { data, isLoading } = useQuery({ 
    queryKey: ['admin-media'], 
    queryFn: () => adminAPI.getMedia().then(res => res.data) 
  })

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    setUploadProgress(0)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`)
          continue
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`)
          continue
        }
        await adminAPI.uploadImage(file)
        setUploadProgress(((i + 1) / files.length) * 100)
      }
      queryClient.invalidateQueries(['admin-media'])
      toast.success(`${files.length} image(s) uploaded and converted to WebP!`)
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileChange = (e) => {
    handleUpload(e.target.files)
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }, [])

  const deleteMutation = useMutation({
    mutationFn: (uuid) => adminAPI.deleteMedia(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media'])
      toast.success('Media deleted')
      setSelectedImage(null)
    }
  })

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const filteredMedia = data?.media?.filter(item => 
    item.original_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalSize = data?.media?.reduce((acc, item) => acc + (item.file_size || 0), 0) || 0

  return (
    <>
      <Helmet><title>Media Library - Admin - Magnetic Clouds</title></Helmet>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-dark-500 mt-1">
            {data?.media?.length || 0} files • {formatFileSize(totalSize)} total
          </p>
        </div>
        <label className="btn-primary cursor-pointer">
          {uploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading {Math.round(uploadProgress)}%</>
          ) : (
            <><ImagePlus className="w-4 h-4 mr-2" /> Upload Images</>
          )}
          <input 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleFileChange} 
            className="hidden" 
            disabled={uploading} 
          />
        </label>
      </div>

      {/* Stats & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <FileImage className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.media?.length || 0}</p>
            <p className="text-xs text-dark-500">Total Images</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
            <p className="text-xs text-dark-500">Storage Used</p>
          </div>
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search images..."
              className="input pl-11 w-full"
            />
          </div>
          <div className="flex border border-dark-200 dark:border-dark-700 rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={clsx("p-2", viewMode === 'grid' ? "bg-primary-500 text-white" : "hover:bg-dark-100 dark:hover:bg-dark-800")}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={clsx("p-2", viewMode === 'list' ? "bg-primary-500 text-white" : "hover:bg-dark-100 dark:hover:bg-dark-800")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            All uploaded images are automatically converted to <strong>WebP format</strong> for optimal performance. 
            Drag and drop images anywhere or click the upload button.
          </p>
        </div>
      </div>

      {/* Drag & Drop Zone / Content */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={clsx(
          "relative min-h-[400px] rounded-2xl transition-all",
          dragActive && "ring-4 ring-primary-500 ring-opacity-50 bg-primary-50 dark:bg-primary-900/20"
        )}
      >
        {dragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-50/90 dark:bg-primary-900/90 rounded-2xl z-10">
            <div className="text-center">
              <Upload className="w-16 h-16 text-primary-500 mx-auto mb-4" />
              <p className="text-xl font-bold text-primary-700 dark:text-primary-300">Drop images here</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredMedia.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map(item => (
                <div 
                  key={item.uuid} 
                  onClick={() => setSelectedImage(item)}
                  className="group relative aspect-square card overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                >
                  <img 
                    src={item.path} 
                    alt={item.alt_text || item.original_filename} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs truncate">{item.original_filename}</p>
                      <p className="text-white/60 text-xs">{formatFileSize(item.file_size)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-800">
                  <tr>
                    <th className="text-left p-4 font-medium">Image</th>
                    <th className="text-left p-4 font-medium">Filename</th>
                    <th className="text-left p-4 font-medium">Size</th>
                    <th className="text-left p-4 font-medium">Uploaded</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                  {filteredMedia.map(item => (
                    <tr key={item.uuid} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                      <td className="p-4">
                        <img 
                          src={item.path} 
                          alt={item.alt_text || item.original_filename}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-medium truncate max-w-xs">{item.original_filename}</p>
                        <p className="text-xs text-dark-500 truncate max-w-xs">{item.path}</p>
                      </td>
                      <td className="p-4 text-dark-500">{formatFileSize(item.file_size)}</td>
                      <td className="p-4 text-dark-500">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => copyUrl(item.path)}
                            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a 
                            href={item.path} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => deleteMutation.mutate(item.uuid)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="card p-12 text-center border-2 border-dashed border-dark-200 dark:border-dark-700">
            <Image className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Media Yet</h2>
            <p className="text-dark-500 mb-6">Upload your first image to get started</p>
            <label className="btn-primary cursor-pointer inline-flex">
              <Upload className="w-4 h-4 mr-2" /> Upload Images
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-dark-900/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white dark:bg-dark-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-700">
              <h3 className="font-bold truncate">{selectedImage.original_filename}</h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-dark-100 dark:bg-dark-900 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]">
                <img 
                  src={selectedImage.path} 
                  alt={selectedImage.alt_text || selectedImage.original_filename}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              <div className="md:w-64 space-y-4">
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Filename</p>
                  <p className="font-medium text-sm break-all">{selectedImage.original_filename}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Size</p>
                  <p className="font-medium">{formatFileSize(selectedImage.file_size)}</p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Uploaded</p>
                  <p className="font-medium">
                    {selectedImage.created_at ? new Date(selectedImage.created_at).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">URL</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={selectedImage.path} 
                      readOnly 
                      className="input text-xs flex-1"
                    />
                    <button 
                      onClick={() => copyUrl(selectedImage.path)}
                      className="btn-secondary p-2"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex flex-col gap-2">
                  <a 
                    href={selectedImage.path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary w-full justify-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Open Original
                  </a>
                  <button 
                    onClick={() => deleteMutation.mutate(selectedImage.uuid)}
                    disabled={deleteMutation.isLoading}
                    className="btn-secondary w-full justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {deleteMutation.isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
