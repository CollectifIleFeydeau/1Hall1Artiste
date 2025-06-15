import React from 'react';
import { runAnalyticsTestSuite, runQuickTests, runSpecificTest } from './analytics-test-suite';

/**
 * Composant bouton pour exécuter les tests d'analytics
 */
const AnalyticsTestButton: React.FC = () => {
  const handleRunFullTests = () => {
    runAnalyticsTestSuite();
  };

  const handleRunQuickTests = () => {
    runQuickTests();
  };

  const handleRunSpecificTest = (testName: string) => {
    runSpecificTest(testName);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRunFullTests}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Exécuter tous les tests Analytics
          </button>
          
          <button
            onClick={handleRunQuickTests}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
          >
            Tests rapides
          </button>
          
          <div className="grid grid-cols-3 gap-1 mt-1">
            <button
              onClick={() => handleRunSpecificTest('page_view')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
            >
              Page View
            </button>
            <button
              onClick={() => handleRunSpecificTest('click')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
            >
              Click
            </button>
            <button
              onClick={() => handleRunSpecificTest('onboarding')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
            >
              Onboarding
            </button>
            <button
              onClick={() => handleRunSpecificTest('map')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
            >
              Map
            </button>
            <button
              onClick={() => handleRunSpecificTest('error')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
            >
              Error
            </button>
            <button
              onClick={() => handleRunSpecificTest('force')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
            >
              Force
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTestButton;
