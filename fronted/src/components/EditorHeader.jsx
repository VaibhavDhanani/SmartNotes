import { ArrowLeft, FileIcon, MoreVertical, RefreshCw, Save, Share, Star } from 'lucide-react'
import React from 'react'

const EditorHeader = ({isSaving, document,handleBack,lastSaved, handleSave}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <FileIcon size={18} />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800 text-lg">
                  {document?.name}
                </h1>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>
                    Last updated{" "}
                    {document?.updated_at
                      ? new Date(document.updated_at).toLocaleString()
                      : "Never"}
                  </span>
                  {lastSaved && (
                    <span>• Auto-saved {lastSaved.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Star size={20} className="text-gray-400 hover:text-yellow-500" />
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share size={20} className="text-gray-700" />
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium transition-colors"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save
                </>
              )}
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>
  )
}

export default EditorHeader
