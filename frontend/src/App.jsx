import { Route, Routes } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Approach from "./Approach";

import AddEvidence from "./AddEvidence";
import VerifyEvidence from "./VerifyEvidence";
import ViewEvidence from "./ViewEvidence";
import SideBySide from "./SideBySide";

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
        
        {/* Side by Side - Add & Check Evidence */}
        <Route path="/dashboard" element={<SideBySide />} />
      </Routes>
    </>
  );
};

export default App;
