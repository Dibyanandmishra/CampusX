import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SOSButton from "./components/SOSButton";
import AdminDashboard from "./components/AdminDashboard";
import CasesView from "./components/CasesView";
import AdminLogin from "./components/AdminLogin";
import { flushQueue } from "./utils/offlineQueue";
import "./App.css";

const mockUser = { id: "user123", name: "John Student", role: "student" };

function App() {
  const [socket, setSocket] = useState(null);
  const [sosReports, setSosReports] = useState([]);
  const [currentView, setCurrentView] = useState("main");
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [beepKey, setBeepKey] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAAA//8AAP//AAD//wAA//8AAP//AAD//wAA"
    );
  }, []);

  const sendSOSPayload = async (payload) => {
    const response = await fetch("/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Network error");
    return response.json();
  };

  useEffect(() => {
    const doFlush = async () => { try { await flushQueue(sendSOSPayload); } catch {} };
    doFlush();
    const onOnline = () => doFlush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationDenied(false); },
      () => { setUserLocation(null); setLocationDenied(true); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    requestLocation();

    newSocket.on("new_sos", (report) => {
      setSosReports((prev) => [report, ...prev]);
      if (currentView === "admin" && isAdmin) {
        try {
          const a = audioRef.current; if (a) { let c = 0; const i = setInterval(()=>{ a.currentTime = 0; a.play().catch(()=>{}); if (++c>=4) clearInterval(i); }, 1000); }
        } catch {}
      }
      setHighlightedIds((ids) => [report._id, ...ids]);
    });

    newSocket.on("resolve_sos", (r) => {
      setSosReports((prev) => prev.map((x) => (x._id === r._id ? r : x)));
      setHighlightedIds((ids) => ids.filter((id) => id !== r._id));
    });

    newSocket.on("delete_sos", (id) => {
      setSosReports((prev) => prev.filter((r) => r._id !== id));
      setHighlightedIds((ids) => ids.filter((x) => x !== id));
    });

    return () => newSocket.close();
  }, [currentView, isAdmin]);

  useEffect(() => {
    if (currentView === "admin" && isAdmin) {
      const activeIds = sosReports.filter((r) => r.status === "active").map((r) => r._id);
      setHighlightedIds(activeIds);
      if (activeIds.length > 0) setBeepKey((k) => k + 1);
    }
  }, [currentView, isAdmin]);

  const fetchSOSReports = async () => {
    try { const res = await fetch("/api/sos"); const data = await res.json(); setSosReports(data); }
    catch (e) { console.error(e); }
  };
  useEffect(() => { fetchSOSReports(); }, []);

  const activeCount = sosReports.filter((r) => r.status === "active").length;
  const adminHasAlert = activeCount > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-red-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚨 Campus Safety SOS</h1>
          <div className="flex space-x-4 items-center">
            <button onClick={()=>setCurrentView("main")} className={`px-4 py-2 rounded ${currentView==='main'?'bg-red-700':'bg-red-500 hover:bg-red-600'}`}>Main</button>
            <button onClick={()=>setCurrentView("cases")} className={`px-4 py-2 rounded ${currentView==='cases'?'bg-red-700':'bg-red-500 hover:bg-red-600'}`}>Cases</button>
            <button onClick={()=>setCurrentView("admin")} className={`relative px-4 py-2 rounded ${currentView==='admin'?'bg-red-700':'bg-red-500 hover:bg-red-600'} ${adminHasAlert?'blink-btn':''}`}>
              Admin
              {adminHasAlert && <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></span>}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {currentView === "main" && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Emergency SOS System</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">If you're in an emergency situation, click the SOS button below to alert campus security with your location.</p>
            <SOSButton socket={socket} userLocation={userLocation} user={mockUser} onSOSSent={fetchSOSReports} onSOSSuccess={()=>{}} locationDenied={locationDenied} onRequestLocation={requestLocation} />
          </div>
        )}
        {currentView === "cases" && (
          <CasesView sosReports={sosReports} userLocation={userLocation} />
        )}
        {currentView === "admin" && (
          isAdmin ? (
            <AdminDashboard sosReports={sosReports} onResolve={()=>fetchSOSReports()} highlightedIds={highlightedIds} beepKey={beepKey} />
          ) : (
            <AdminLogin onSuccess={()=>setIsAdmin(true)} />
          )
        )}
      </main>
    </div>
  );
}

export default App;
