import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Pages/Home';
import Recording from './Pages/AudioRecorder';

const App: React.FC = () => {
  return (
    <Router>

      <nav className="bg-blue-600 p-5 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
          <Link to="/" className="text-2xl font-extrabold text-yellow-300 hover:text-yellow-400 transition-colors">
            TASK
          </Link>


          <div className="space-x-6 hidden md:flex">
            <Link to="/" className="hover:text-indigo-200 transition-colors">Home</Link>
            <Link to="/recording" className="hover:text-indigo-200 transition-colors">Recording</Link>
          </div>

     
          <div className="md:hidden">
            <button className="text-white focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recording" element={<Recording />} />
      </Routes>
    </Router>
  );
};

export default App;
