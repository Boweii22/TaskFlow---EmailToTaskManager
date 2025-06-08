import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const authorName = "Bowei Tombri"; 
  const githubLink: string | null = "https://github.com/Boweii22";
  const challengeLink: string | null = "https://dev.to/challenges/postmark";
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>
          Developed by {authorName} &copy; {currentYear}. 
          {githubLink && (
            <> | <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub</a></>
          )}
          {challengeLink && (
            <> | <a href={challengeLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Postmark Challenge</a></>
          )}
        </p>
        <p className="mt-1">
          TaskFlow - Email-to-Task Manager for Postmark Challenge.
        </p>
      </div>
    </footer>
  );
}; 