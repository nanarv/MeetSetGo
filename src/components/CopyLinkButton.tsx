import { useState } from 'react';

interface CopyLinkButtonProps {
  url: string;
}

export const CopyLinkButton = ({ url }: CopyLinkButtonProps) => {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded bg-gray-100 px-2 py-1 text-sm">{url}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50"
      >
        {status === 'copied' ? 'Copied!' : 'Copy link'}
      </button>
      {status === 'failed' && (
        <span role="alert" className="text-sm text-red-700">
          Couldn't copy. Select the link and copy it manually.
        </span>
      )}
    </div>
  );
};
