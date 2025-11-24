'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WalletErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // WalletConnect関連のエラーかチェック
    const isWalletConnectError = error.message.includes('WalletConnect') ||
                                error.message.includes('walletconnect') ||
                                error.message.includes('pulse.walletconnect.org');

    if (isWalletConnectError) {
      console.warn('WalletConnect error detected, this is usually not critical');
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handlePageReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isWalletConnectError = this.state.error?.message.includes('WalletConnect') ||
                                  this.state.error?.message.includes('walletconnect') ||
                                  this.state.error?.message.includes('pulse.walletconnect.org');

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {isWalletConnectError ? 'ウォレット接続エラー' : 'アプリケーションエラー'}
                </h3>
                
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {isWalletConnectError ? (
                    <div className="space-y-2">
                      <p>ウォレット接続サービスで一時的な問題が発生しています。</p>
                      <p>通常、この問題はアプリの動作に影響しません。</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>予期しないエラーが発生しました。</p>
                      <p className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono break-all">
                        {this.state.error?.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    再試行
                  </button>
                  
                  {!isWalletConnectError && (
                    <button
                      onClick={this.handlePageReload}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      ページを再読み込み
                    </button>
                  )}
                </div>

                {isWalletConnectError && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 このエラーはウォレット接続の統計収集に関連しており、
                      アプリケーションの基本機能には影響しません。
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}