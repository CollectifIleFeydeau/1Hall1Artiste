import Check from "lucide-react/dist/esm/icons/check";

interface VisitProgressProps {
  visitedCount: number;
  totalCount: number;
}

export function VisitProgress({ visitedCount, totalCount }: VisitProgressProps) {
  const percentage = Math.round((visitedCount / totalCount) * 100);
  
  return (
    <div className="bg-white rounded-full shadow-md p-2 flex items-center space-x-2">
      <div className="relative h-6 w-6 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full bg-[#ff7a45] flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
        <span className="absolute text-[10px] font-bold text-white">{visitedCount}</span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ff7a45]" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-medium">{visitedCount}/{totalCount}</span>
        </div>
        <span className="text-xs text-gray-500">lieux visités</span>
      </div>
    </div>
  );
}

