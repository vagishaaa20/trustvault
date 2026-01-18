import { Route, Routes } from "react-router-dom";
//import Login from "./Login";
import Home from "./Home";
import Landing from "./pages/Landing";
import Login from "./pages/login";
import Register from "./pages/Register";
import ActivityLog from "./pages/ActivityLog";


import AddEvidence from "./AddEvidence";
import CheckEvidence from "./CheckEvidence";
import VerifyEvidence from "./VerifyEvidence";
import ViewEvidence from "./ViewEvidence";
import SideBySide from "./SideBySide";
import DeepfakeDetection from "./DeepfakeDetection";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/log-file" element={<ActivityLog />} />
        
        {/* Approach */}
        <Route path="/approach" element={<ViewEvidence />} />

        {/* Evidence Chain of Custody */}
        <Route path="/add-evidence" element={<AddEvidence />} />
        <Route path="/check-evidence" element={<CheckEvidence />} />
        <Route path="/verify-evidence" element={<VerifyEvidence />} />
        <Route path="/view-evidence" element={<ViewEvidence />} />
        
        {/* Deepfake Detection */}
        <Route path="/deepfake-detection" element={<DeepfakeDetection />} />
        
        {/* Side by Side - Add & Check Evidence */}
        <Route path="/dashboard" element={<SideBySide />} />
        
        
      </Routes>
    </>
  );
};

export default App;
