import { Edit3, Eye, Mail, RefreshCw, UserPlus, X } from "lucide-react";

const ShareModal = ({
  onClose,
  inviteEmail,
  setInviteEmail,
  selectedPermission,
  setSelectedPermission,
  handleShareAccess,
  isInviting,
}) => (
  <>
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-50"
      onClick={onClose}
    />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Share Document
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-300 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleShareAccess} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                name="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission Level
            </label>
            {["view", "edit"].map((type) => (
              <label
                key={type}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer mb-2"
              >
                <input
                  type="radio"
                  name="permission"
                  value={type}
                  checked={selectedPermission === type}
                  onChange={(e) => setSelectedPermission(e.target.value)}
                />
                {type === "view" ? (
                  <Eye size={16} className="text-gray-500" />
                ) : (
                  <Edit3 size={16} className="text-green-600" />
                )}
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    Can {type}
                  </div>
                  <div className="text-xs text-gray-500">
                    {type === "view"
                      ? "Read-only access"
                      : "Full editing access"}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInviting || !inviteEmail.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center justify-center space-x-2"
            >
              {isInviting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Inviting...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Send Invite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </>
);

export default ShareModal;
