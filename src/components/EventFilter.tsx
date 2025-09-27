// EventFilter renders two textual filter buttons with proper accessibility
interface EventFilterProps {
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

export function EventFilter({ onFilterChange, currentFilter }: EventFilterProps) {
  return (
    <div className="flex justify-center gap-2 mb-4 px-2">
      <button
        type="button"
        onClick={() => onFilterChange("exposition")}
        className={`rounded-full px-4 py-2 border font-medium text-sm flex-1 max-w-[140px] transition-colors ${
          currentFilter === "exposition"
            ? "bg-[#ff7a45] hover:bg-[#ff9d6e] text-white border-[#ff7a45] shadow-md"
            : "bg-white/80 text-gray-700 hover:bg-white border-gray-300 shadow-sm"
        }`}
        aria-pressed={currentFilter === "exposition"}
      >
        Expositions
      </button>
      <button
        type="button"
        onClick={() => onFilterChange("concert")}
        className={`rounded-full px-4 py-2 border font-medium text-sm flex-1 max-w-[140px] transition-colors ${
          currentFilter === "concert"
            ? "bg-[#ff7a45] hover:bg-[#ff9d6e] text-white border-[#ff7a45] shadow-md"
            : "bg-white/80 text-gray-700 hover:bg-white border-gray-300 shadow-sm"
        }`}
        aria-pressed={currentFilter === "concert"}
      >
        Concerts
      </button>
    </div>
  );
}
