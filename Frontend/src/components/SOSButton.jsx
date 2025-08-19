import React, { useEffect, useRef, useState } from "react";
import { enqueueSOS } from "../utils/offlineQueue";

const SOSButton = ({
  socket,
  userLocation,
  user,
  onSOSSent,
  onSOSSuccess,
  locationDenied = false,
  onRequestLocation,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [awaitingLocation, setAwaitingLocation] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [queued, setQueued] = useState(false);
  const waitTimerRef = useRef(null);

  useEffect(() => {
    if (awaitingLocation && userLocation) {
      clearTimeout(waitTimerRef.current);
      setAwaitingLocation(false);
      setIsLoading(false);
      setShowLocationPrompt(false);
      setShowConfirmation(true);
      setPromptError("");
    }
  }, [userLocation, awaitingLocation]);

  const handleSOSClick = async () => {
    if (userLocation) { setShowConfirmation(true); return; }
    setIsLoading(true);
    setAwaitingLocation(true);
    setShowLocationPrompt(true);
    setPromptError("");
    onRequestLocation && onRequestLocation();
    clearTimeout(waitTimerRef.current);
    waitTimerRef.current = setTimeout(() => {
      if (!userLocation) {
        setAwaitingLocation(false);
        setIsLoading(false);
        setPromptError("We couldn't get your location. Please enable GPS and allow location, then tap 'Try Again'.");
      }
    }, 10000);
  };

  const sendSOSPayload = async (payload) => {
    const response = await fetch("/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Network error");
    return response.json();
  };

  const confirmSOS = async () => {
    setIsLoading(true);
    setShowConfirmation(false);
    const payload = { userId: user.id, userName: user.name, location: userLocation, type: "emergency", description: "Emergency SOS alert triggered by user" };
    try {
      const report = await sendSOSPayload(payload);
      if (socket) socket.emit("new_sos", report);
      onSOSSent && onSOSSent();
      onSOSSuccess && onSOSSuccess(report);
      setQueued(false);
    } catch (error) {
      enqueueSOS(payload);
      setQueued(true);
      setPromptError("");
      setShowLocationPrompt(true);
    } finally { setIsLoading(false); }
  };

  const cancelSOS = () => setShowConfirmation(false);

  const buttonLabel = isLoading || awaitingLocation ? "⏳" : userLocation ? "🚨 SOS 🚨" : "❗";

  const renderLocationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
        <div className="flex items-center mb-3"><span className="text-2xl mr-2">❗</span><h3 className="text-xl font-bold text-gray-800">Location Required</h3></div>
        {queued ? (
          <p className="text-gray-700 mb-4">You are offline. Your SOS is <span className="font-semibold">queued</span> and will be sent automatically when internet returns.</p>
        ) : (
          <p className="text-gray-700 mb-4">We need your live location to send an SOS. Please turn on device GPS and allow location for this site.</p>
        )}
        {promptError && <div className="text-red-600 text-sm mb-3">{promptError}</div>}
        <div className="flex flex-wrap gap-3">
          {!queued && (
            <button onClick={() => {
              setPromptError(""); setIsLoading(true); setAwaitingLocation(true); onRequestLocation && onRequestLocation();
              clearTimeout(waitTimerRef.current);
              waitTimerRef.current = setTimeout(() => {
                if (!userLocation) { setAwaitingLocation(false); setIsLoading(false); setPromptError("Still waiting for location. Make sure GPS is ON and location permission is ALLOWED."); }
              }, 8000);
            }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{awaitingLocation ? "Trying..." : "Try Again"}</button>
          )}
          {queued && (
            <a href={`tel:911`} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Call Emergency</a>
          )}
          <button onClick={() => setShowLocationPrompt(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
          <h3 className="text-2xl font-bold text-red-600 mb-4">⚠️ Confirm SOS Alert</h3>
          <p className="text-gray-700 mb-6">Are you sure you want to send an emergency SOS alert? This will immediately notify campus security of your location.</p>
          <div className="flex space-x-4">
            <button onClick={cancelSOS} className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
            <button onClick={confirmSOS} disabled={isLoading} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">{isLoading ? "Sending..." : "Send SOS"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3">
      <button onClick={handleSOSClick} disabled={isLoading} className="sos-button w-48 h-48 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full text-4xl font-bold shadow-2xl flex items-center justify-center mx-auto">{buttonLabel}</button>
      {!userLocation && (<div className="text-sm text-gray-600 max-w-md mx-auto">Location is required. Tap SOS to enable. If prompted, allow location access for this site and turn on device GPS.</div>)}
      {showLocationPrompt && renderLocationModal()}
    </div>
  );
};

export default SOSButton;
