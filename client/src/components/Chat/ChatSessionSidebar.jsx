import React, { useState } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const ChatSessionSidebar = ({ 
  sessions, 
  activeSession, 
  onSessionSelect, 
  onCreateSession, 
  onRenameSession, 
  onDeleteSession 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startEdit = (session) => {
    setEditingId(session.id);
    setEditName(session.name);
  };

  const saveEdit = (sessionId) => {
    if (editName.trim()) {
      onRenameSession(sessionId, editName.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r-2 border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-2 border-gray-200 dark:border-gray-700">
        <button
          onClick={onCreateSession}
          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No chat sessions yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "New Chat" to start</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative rounded-xl transition-all ${
                  activeSession?.id === session.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-300 dark:border-indigo-600'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {editingId === session.id ? (
                  // Edit Mode
                  <div className="p-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(session.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="w-full px-2 py-1 text-sm border-2 border-indigo-300 dark:border-indigo-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                      autoFocus
                    />
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => saveEdit(session.id)}
                        className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <button
                      onClick={() => onSessionSelect(session)}
                      className="w-full p-3 text-left"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">
                          {session.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {session.message_count || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(session.updated_at)}
                      </p>
                    </button>

                    {/* Action Buttons */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(session);
                        }}
                        className="p-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this chat session?')) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="p-1.5 bg-white dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t-2 border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {sessions.length} {sessions.length === 1 ? 'conversation' : 'conversations'}
        </p>
      </div>
    </div>
  );
};

export default ChatSessionSidebar;
