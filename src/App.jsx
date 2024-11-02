import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FetchingPage from "./pages/FetchingPage"
import PetcamPage from "./pages/PetcamPage"

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/fetching-page" element={<FetchingPage />} />
                <Route path="/petcam-page" element={<PetcamPage />} />
            </Routes>
        </Router>

        
    )
}

export default App
