import React from 'react';
import { UI_TEXT } from '../../utils/constants';

export function LoadingSpinner({ size = 'md', text = null }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="w-full h-full border-4 border-slate-600 border-t-blue-600 rounded-full"></div>
      </div>
      {text && (
        <p className="text-slate-400 text-sm text-center font-medium">
          {text}
        </p>
      )}
    </div>
  );
}

export function ErrorMessage({ error, onRetry = null }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-50">Erreur</h3>
        <p className="text-slate-400 max-w-sm">
          {error || 'Une erreur inattendue s\'est produite'}
        </p>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {UI_TEXT.buttons.retry}
        </button>
      )}
    </div>
  );
}