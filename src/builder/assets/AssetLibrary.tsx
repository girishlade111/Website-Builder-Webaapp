'use client';

import React, { useState, useRef, useCallback } from 'react';
import { assetsApi } from '@/lib/apiClient';
import type { Asset as ApiAsset } from '@/lib/apiClient';
import { Image, Video, File, Music, Type, Upload, Trash2, Search, X, Grid, List, Loader2, AlertCircle } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'FONT' | 'OTHER';
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
}

interface AssetLibraryProps {
  projectId: string;
  onSelect?: (asset: Asset) => void;
  onClose: () => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ projectId, onSelect, onClose }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadAssets();
  }, [projectId]);

  const loadAssets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await assetsApi.list(projectId);
      if (result.success && result.data) {
        const data = result.data as any;
        setAssets(data.items || data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await assetsApi.upload(projectId, file);
        if (result.success && result.data) {
          const asset = result.data as unknown as Asset;
          setAssets(prev => [asset, ...prev]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload asset');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [projectId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      // Note: Delete endpoint not implemented yet in API
      setAssets(prev => prev.filter(a => a.id !== assetId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete asset');
    }
  };

  const handleSelect = (asset: Asset) => {
    if (onSelect) {
      onSelect(asset);
    }
    onClose();
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image className="w-5 h-5" />;
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'AUDIO':
        return <Music className="w-5 h-5" />;
      case 'DOCUMENT':
        return <File className="w-5 h-5" />;
      case 'FONT':
        return <Type className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredAssets = assets.filter(asset => {
    const matchesType = filterType === 'ALL' || asset.type === filterType;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Asset Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.woff,.woff2,.ttf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Types</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Videos</option>
            <option value="AUDIO">Audio</option>
            <option value="DOCUMENT">Documents</option>
            <option value="FONT">Fonts</option>
          </select>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Mode */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="mx-4 mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max file size: 10MB
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>No assets found</p>
              <p className="text-sm mt-1">Upload images, videos, or other files</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelect ? handleSelect(asset) : setSelectedAsset(asset)}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  {asset.type === 'IMAGE' && asset.url ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {getAssetIcon(asset.type)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-end justify-end p-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-xs text-white truncate">{asset.name}</p>
                    <p className="text-xs text-gray-300">{formatFileSize(asset.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelect ? handleSelect(asset) : setSelectedAsset(asset)}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                    {asset.type === 'IMAGE' && asset.thumbnailUrl ? (
                      <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      getAssetIcon(asset.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                    <p className="text-sm text-gray-500">
                      {asset.type} • {formatFileSize(asset.size)}
                      {asset.width && asset.height && ` • ${asset.width}x${asset.height}`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Asset Preview */}
        {selectedAsset && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                {selectedAsset.type === 'IMAGE' ? (
                  <img src={selectedAsset.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {getAssetIcon(selectedAsset.type)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedAsset.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedAsset.type} • {formatFileSize(selectedAsset.size)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{selectedAsset.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAsset.url);
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleSelect(selectedAsset)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Insert
                </button>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetLibrary;
