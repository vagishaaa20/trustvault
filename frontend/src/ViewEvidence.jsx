import { useEffect, useState } from "react";

const ViewEvidence = () => {
  const [events, setEvents] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/timeline")
      .then(res => res.json())
      .then(data => setEvents(data.timeline));
  }, []);

  return (
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {events}
    </pre>
  );
};

export default ViewEvidence;
