'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  resolveFeatureFlags,
  toggleFeatureFlag,
  getAllFlagKeys,
  getFlagsFromURL,
  type FeatureFlags,
} from '../lib/featureFlags';

export default function FeatureFlagBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [allKeys, setAllKeys] = useState<string[]>([]);

  // Load flags on mount and when URL changes
  useEffect(() => {
    const loadFlags = () => {
      setFlags(resolveFeatureFlags());
      setAllKeys(getAllFlagKeys());
    };

    loadFlags();

    // Listen for URL changes
    const handlePopState = () => loadFlags();
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + .)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleFlag = useCallback((key: string) => {
    const newFlags = toggleFeatureFlag(key, flags);
    setFlags(newFlags);
  }, [flags]);

  const urlFlags = getFlagsFromURL();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => !isPinned && setIsOpen(false)}
        />
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-80 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Feature Flags</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1 rounded text-xs ${
                  isPinned 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isPinned ? 'Unpin panel' : 'Pin panel'}
              >
                📌
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-gray-600 hover:bg-gray-200"
                title="Close panel"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {allKeys.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm text-center">
                No feature flags configured.
                <br />
                Add flags to <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_FEATURE_FLAGS</code>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {allKeys.map((key) => {
                  const isActive = flags[key];
                  const isFromURL = key in urlFlags;
                  
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded border border-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
                            {key}
                          </span>
                          {isFromURL && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                              URL
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => !isFromURL && handleToggleFlag(key)}
                        disabled={isFromURL}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isActive 
                            ? 'bg-blue-600' 
                            : 'bg-gray-200'
                        } ${
                          isFromURL 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'cursor-pointer'
                        }`}
                        title={isFromURL ? 'Controlled by URL parameter' : `Toggle ${key}`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out ${
                            isActive ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            <div>💡 <strong>Tip:</strong> Use <code>Cmd/Ctrl + .</code> to toggle</div>
            <div>🔗 Override via URL: <code>?flags=key1,key2=false</code></div>
          </div>
        </div>
      )}

      {/* Toggle Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
          isOpen ? 'bg-blue-700' : ''
        }`}
        title="Toggle Feature Flags (Cmd/Ctrl + .)"
      >
        🏴‍☠️ {allKeys.filter(key => flags[key]).length}/{allKeys.length}
      </button>
    </>
  );
}