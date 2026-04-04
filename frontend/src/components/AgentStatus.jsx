export default function AgentStatus({ statusText }) {
  return (
    <div className="flex items-center space-x-3 w-full mt-4 max-w-2xl">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold animate-pulse">
        ...
      </div>
      <div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          <p className="text-sm text-gray-500 italic">{statusText || 'The Board is consulting...'}</p>
        </div>
      </div>
    </div>
  );
}
