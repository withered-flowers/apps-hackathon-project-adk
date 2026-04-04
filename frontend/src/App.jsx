import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Decidely.ai
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Stop overthinking and start doing.
          </p>
        </div>
        
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
