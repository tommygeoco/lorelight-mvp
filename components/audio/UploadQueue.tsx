'use client'

import { Music, X } from 'lucide-react'

interface UploadQueueItem {
  file: File
  name: string
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  message: string
}

interface UploadQueueProps {
  uploadQueue: UploadQueueItem[]
  focusedQueueItemId: string | null
  onUpdateName: (id: string, name: string) => void
  onRemoveFromQueue: (id: string) => void
  onFocus: (id: string) => void
  onBlur: () => void
  onClearQueue: () => void
  onUploadAll: () => void
}

export function UploadQueue({
  uploadQueue,
  focusedQueueItemId,
  onUpdateName,
  onRemoveFromQueue,
  onFocus,
  onBlur,
  onClearQueue,
  onUploadAll,
}: UploadQueueProps) {
  if (uploadQueue.length === 0) return null

  const pendingCount = uploadQueue.filter(item => item.status === 'pending').length
  const isUploading = uploadQueue.some(item => item.status === 'uploading')
  const hasInvalidNames = uploadQueue.some(item => !item.name.trim() || item.status !== 'pending')

  return (
    <div className="px-6 pt-3 pb-3">
      <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-[8px] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70 font-semibold">
            Upload {uploadQueue.length} file{uploadQueue.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* File list */}
        <div className="space-y-2">
          {uploadQueue.map((item) => (
            <div
              key={item.id}
              className={`space-y-2 transition-opacity duration-300 ${
                item.status === 'complete' ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className={`flex items-center gap-3 rounded-[6px] p-3 transition-colors ${
                focusedQueueItemId === item.id ? 'bg-white/10' : 'bg-white/5'
              }`}>
                <Music className="w-4 h-4 text-white/40 flex-shrink-0" />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdateName(item.id, e.target.value)}
                  onFocus={() => onFocus(item.id)}
                  onBlur={onBlur}
                  disabled={item.status !== 'pending'}
                  className="flex-1 px-3 py-1 bg-transparent border-none text-[13px] text-white focus:outline-none rounded disabled:opacity-50"
                />
                {item.status === 'pending' && (
                  <button
                    onClick={() => onRemoveFromQueue(item.id)}
                    className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {item.status === 'complete' && (
                  <span className="flex-shrink-0 text-green-400 text-[12px] font-medium">✓</span>
                )}
                {item.status === 'error' && (
                  <span className="flex-shrink-0 text-red-400 text-[12px] font-medium">✗</span>
                )}
              </div>

              {/* Individual progress bar */}
              {(item.status === 'uploading' || item.status === 'complete') && (
                <div className="space-y-1 px-3">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {item.message && (
                    <p className="text-[11px] text-white/50">{item.message}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!isUploading && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClearQueue}
              className="px-4 py-2 text-[14px] font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-[8px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onUploadAll}
              disabled={hasInvalidNames}
              className="px-4 py-2 text-[14px] font-semibold text-black bg-white rounded-[8px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
