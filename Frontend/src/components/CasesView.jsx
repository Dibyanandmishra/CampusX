import React from "react";
import CaseMap from "./CaseMap";

const CasesView = ({ sosReports, userLocation }) => {
  const activeReports = (sosReports || [])
    .filter((r) => r.status === "active")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div>
      <div className="mb-4 bg-gray-50 rounded-lg p-3 shadow-sm w-max mx-auto">
        <div className="flex space-x-6 text-sm items-center">
          <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span><span>Active SOS</span></div>
          <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span><span>Resolved</span></div>
          <div className="flex items-center"><span className="text-2xl mr-2">📍</span><span>Your Location</span></div>
        </div>
      </div>

      {activeReports.length === 0 ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center text-gray-600">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-lg">No active SOS reports</div>
          </div>
        </div>
      ) : (
        activeReports.map((report) => (
          <CaseMap key={report._id} report={report} userLocation={userLocation} />
        ))
      )}
    </div>
  );
};

export default CasesView;
