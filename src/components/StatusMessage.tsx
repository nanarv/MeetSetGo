import type { PropsWithChildren } from 'react';

interface StatusMessageProps {
  tone?: 'info' | 'error';
}

/** Consistent loading / empty / error text. */
export const StatusMessage = ({ tone = 'info', children }: PropsWithChildren<StatusMessageProps>) =>
  tone === 'error' ? (
    <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">
      {children}
    </p>
  ) : (
    <p role="status" className="text-gray-600">
      {children}
    </p>
  );
