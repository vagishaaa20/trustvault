import { Route, Routes } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Approach from "./Approach";

import AddEvidence from "./AddEvidence";
import VerifyEvidence from "./VerifyEvidence";
import ViewEvidence from "./ViewEvidence";
import SideBySide from "./SideBySide";
import DeepfakeDetection from "./DeepfakeDetection";
import BlockchainEvents from "./BlockchainEvents";
import UserActivityLog from "./UserActivityLog";

const App = () => {
  return (
    <>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />
        
        {/* Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Approach */}
        <Route path="/approach" element={<Approach />} />

        {/* Evidence Chain of Custody */}
        <Route path="/add-evidence" element={<AddEvidence />} />
        <Route path="/verify-evidence" element={<VerifyEvidence />} />
        <Route path="/view-evidence" element={<ViewEvidence />} />
        
        {/* Deepfake Detection */}
        <Route path="/deepfake-detection" element={<DeepfakeDetection />} />
        
        {/* Side by Side - Add & Check Evidence */}
        <Route path="/dashboard" element={<SideBySide />} />
        
        {/* Blockchain Event Log */}
        <Route path="/blockchain-events" element={<BlockchainEvents />} />
        <Route path="/blockchain" element={<BlockchainEvents />} />
        <Route path="/api/blockchain/events" element={<BlockchainEvents />} />
        
        {/* User Activity Log */}
        <Route path="/activity-log" element={<UserActivityLog />} />
        <Route path="/user-activity" element={<UserActivityLog />} />
      </Routes>
    </>
  );
};

export default App;
