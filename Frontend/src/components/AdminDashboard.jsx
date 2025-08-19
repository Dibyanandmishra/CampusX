import React, { useEffect, useRef, useState } from "react";

const AdminDashboard = ({ sosReports, onResolve, highlightedIds = [], beepKey }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [soundOn, setSoundOn] = useState(true);

  const audioCtxRef = useRef(null);
  const ensureAudioCtx = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  const playAlert = () => {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const durationMs = 4000;
    let elapsed = 0;
    const playBeep = () => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.05;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      setTimeout(() => { oscillator.stop(); oscillator.disconnect(); gain.disconnect(); }, 250);
    };
    playBeep();
    const interval = setInterval(() => { elapsed += 500; if (elapsed >= durationMs) { clearInterval(interval); } else { playBeep(); } }, 500);
  };

  useEffect(() => { if (typeof beepKey !== "undefined" && soundOn) { playAlert(); } }, [beepKey]);

  const prevCountRef = useRef(0);
  useEffect(() => {
    if (highlightedIds.length > prevCountRef.current) { if (soundOn) playAlert(); }
    prevCountRef.current = highlightedIds.length;
  }, [highlightedIds, soundOn]);

  const filteredReports = sosReports.filter((report) => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesSearch = report.userName.toLowerCase().includes(searchTerm.toLowerCase()) || report.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleResolve = async (reportId) => {
    if (!confirm("Are you sure you want to mark this SOS report as resolved?")) return;
    try {
      const response = await fetch(`/api/sos/${reportId}/resolve`, { method: "PATCH", headers: { "Content-Type": "application/json" } });
      if (response.ok) { onResolve(); alert("SOS report marked as resolved successfully!"); }
      else throw new Error("Failed to resolve SOS report");
    } catch (error) { console.error("Error resolving SOS report:", error); alert("Failed to resolve SOS report. Please try again."); }
  };

  const handleDelete = async (reportId) => {
    if (!confirm("Delete this SOS report permanently?")) return;
    try { const res = await fetch(`/api/sos/${reportId}`, { method: "DELETE" }); if (!res.ok) throw new Error("Delete failed"); onResolve(); }
    catch { alert("Failed to delete report"); }
  };

  const handleClearResolved = async () => {
    if (!confirm("Delete all resolved reports? This cannot be undone.")) return;
    try { const res = await fetch(`/api/sos/resolved/all`, { method: "DELETE" }); if (!res.ok) throw new Error("Delete resolved failed"); onResolve(); }
    catch { alert("Failed to delete resolved reports"); }
  };

  const getStatusBadge = (status) => status === "active" ? (
    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Active</span>
  ) : (
    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Resolved</span>
  );

  const getTypeBadge = (type) => {
    const typeColors = { emergency: "bg-red-100 text-red-800", medical: "bg-blue-100 text-blue-800", security: "bg-yellow-100 text-yellow-800", other: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[type] || typeColors.other}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>;
  };

  const isHighlighted = (id) => highlightedIds.includes(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div>
            Total Reports: {sosReports.length} | Active: {sosReports.filter((r) => r.status === "active").length} | Resolved: {sosReports.filter((r) => r.status === "resolved").length}
          </div>
          <label className="inline-flex items-center space-x-2">
            <input type="checkbox" checked={soundOn} onChange={(e)=>{ setSoundOn(e.target.checked); if (e.target.checked) ensureAudioCtx(); }} />
            <span>Sound</span>
          </label>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex space-x-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="resolved">Resolved Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input type="text" placeholder="Search by name or type..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button onClick={handleClearResolved} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Clear Resolved</button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No SOS reports found</td></tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id} className={`hover:bg-gray-50 ${report.status === "active" && isHighlighted(report._id) ? "blink" : ""}`}>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.userName}</div>
                      <div className="text-sm text-gray-500">ID: {report.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(report.type)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {report.status === "active" && (
                        <button onClick={()=>handleResolve(report._id)} className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md transition-colors">Resolve</button>
                      )}
                      {report.status === "resolved" && (
                        <>
                          <span className="text-gray-400 mr-2">Resolved</span>
                          <button onClick={()=>handleDelete(report._id)} className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
