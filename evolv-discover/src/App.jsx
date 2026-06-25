import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Discover from './pages/Discover/Discover';
import './styles/globals.css';

// For now, we only have Discover page
// Later you can add Dashboard, Applications, etc.
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Discover />} />
                <Route path="/discover" element={<Discover />} />
                {/* Add other routes as you build them */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;