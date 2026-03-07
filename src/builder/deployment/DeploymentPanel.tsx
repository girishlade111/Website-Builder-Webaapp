'use client';

import React, { useState, useEffect } from 'react';
import { deploymentsApi, projectsApi } from '@/lib/apiClient';
import { Rocket, CheckCircle, XCircle, Clock, Loader2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface Deployment {
  id: string;
  status: 'PENDING' | 'BUILDING' | 'DEPLOYING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  vercelUrl?: string;
  vercelError?: string;
  buildLog?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeploymentPanelProps {
  projectId: string;
  onClose: () => void;
}

export const DeploymentPanel: React.FC<DeploymentPanelProps> = ({ projectId, onClose }) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState<'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'>('PRODUCTION');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeployments();
  }, [projectId]);

  const loadDeployments = async () => {
    setIsLoading(true);
    try {
      const result = await deploymentsApi.list(projectId);
      if (result.success && result.data) {
        setDeployments(result.data as unknown as Deployment[]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load deployments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);

    try {
      const result = await deploymentsApi.create(projectId, selectedEnv);
      if (result.success) {
        await loadDeployments();
      } else {
        setError(result.error || 'Failed to start deployment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start deployment');
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
      case 'BUILDING':
      case 'DEPLOYING':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PENDING':
        return 'text-gray-600 bg-gray-50';
      case 'BUILDING':
      case 'DEPLOYING':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEnvironmentBadge = (env: string) => {
    switch (env) {
      case 'PRODUCTION':
        return 'bg-purple-100 text-purple-700';
      case 'STAGING':
        return 'bg-yellow-100 text-yellow-700';
      case 'DEVELOPMENT':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Deploy Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Deploy Button */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Deploy to Environment</h3>
            <div className="flex items-center gap-3 mb-4">
              <select
                value={selectedEnv}
                onChange={(e) => setSelectedEnv(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DEVELOPMENT">Development</option>
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
              </select>
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Deploy
                  </>
                )}
              </button>
              <button
                onClick={loadDeployments}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            <p className="text-xs text-gray-500">
              This will build your project and deploy it to Vercel. The deployment URL will be available after completion.
            </p>
          </div>

          {/* Deployment History */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Deployment History</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : deployments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No deployments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(deployment.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deployment.status)}`}>
                          {deployment.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEnvironmentBadge(deployment.environment)}`}>
                          {deployment.environment}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(deployment.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {deployment.vercelUrl && (
                      <a
                        href={deployment.vercelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {deployment.vercelUrl}
                      </a>
                    )}
                    {deployment.vercelError && (
                      <p className="text-sm text-red-600 mt-2">{deployment.vercelError}</p>
                    )}
                    {deployment.buildLog && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                          View build log
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-900 text-gray-100 text-xs rounded overflow-x-auto max-h-48 overflow-y-auto">
                          {deployment.buildLog}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentPanel;
