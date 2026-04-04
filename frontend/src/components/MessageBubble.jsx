export default function MessageBubble({ role, content }) {
  const isUser = role === 'user';
  
  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-2xl ${isUser ? 'ml-auto justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
          D
        </div>
      )}
      <div>
        <div className={`p-4 rounded-lg shadow-sm ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        <span className={`text-xs text-gray-500 leading-none mt-1 inline-block ${isUser ? 'text-right w-full' : ''}`}>
          {isUser ? 'You' : 'The Board of Directors'}
        </span>
      </div>
      {isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold shadow-md">
          U
        </div>
      )}
    </div>
  );
}
