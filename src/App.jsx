import React from 'react';
import CanvasDrawingApp from './components/CanvasDrawingApp';

function App() {
  return (
    <div className="App">
      <header className='flex flex-col items-center p-4'><h1 className="text-2xl">Lil Fast</h1></header>
      <CanvasDrawingApp />
    </div>
  );
}

export default App;