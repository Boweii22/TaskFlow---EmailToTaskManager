import React from 'react';
import { X, Copy } from 'lucide-react';
import { Task } from '../types/task'; // Reusing Task interface for context

interface EmailInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inboundEmailAddress: string;
}

export const EmailInstructionsModal: React.FC<EmailInstructionsModalProps> = ({
  isOpen,
  onClose,
  inboundEmailAddress,
}) => {
  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally add a temporary visual feedback like a tooltip
    alert('Copied to clipboard!'); 
  };

  const exampleSubject = "Review project proposal";
  const exampleBody = `Hi TaskFlow,

Please review the attached project proposal by end of day.

Due: tomorrow
Priority: high
Tags: work, urgent, proposal

Thanks!`

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Email-to-Task Instructions
        </h2>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          You can create new tasks by sending an email to your unique TaskFlow address. 
          Include smart parsing patterns in the email body for automatic task detail recognition.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your TaskFlow Email Address:</h3>
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <input
              type="text"
              readOnly
              value={inboundEmailAddress}
              className="flex-grow border-none bg-transparent text-gray-800 dark:text-gray-100 font-mono text-sm outline-none"
            />
            <button
              onClick={() => handleCopy(inboundEmailAddress)}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
              title="Copy email address"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Format:</h3>
          
          <div className="mb-4">
            <p className="font-medium text-gray-800 dark:text-gray-200">Subject:</p>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm font-mono whitespace-pre-wrap">{exampleSubject}</pre>
          </div>

          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">Body:</p>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm font-mono whitespace-pre-wrap">{exampleBody}</pre>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Include these patterns for smart parsing (case-insensitive):
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 ml-4">
              <li><span className="font-semibold">Due:</span> tomorrow, 2025-06-10, 3 days</li>
              <li><span className="font-semibold">Priority:</span> high, medium, low</li>
              <li><span className="font-semibold">Tags:</span> work, urgent, meeting</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}; 