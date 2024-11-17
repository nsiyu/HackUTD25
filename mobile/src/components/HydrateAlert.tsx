interface HydrateAlertProps {
  wellId: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  onInteract?: () => void;
}

export function HydrateAlert({ wellId, timestamp, severity, onInteract }: HydrateAlertProps) {
  const handleInteraction = async () => {
    if (onInteract) {
      onInteract();
    }
    window.open(`${import.meta.env.VITE_APP_URL}/api/frame/${wellId}`, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Hydrate Alert: Well {wellId}
          </h3>
          <p className="text-sm text-gray-500">{timestamp}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm ${
          severity === 'high' ? 'bg-off-red text-white' :
          severity === 'medium' ? 'bg-saffron text-night' :
          'bg-paynes text-white'
        }`}>
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </span>
      </div>
      
      <button 
        onClick={handleInteraction}
        className="mt-4 w-full bg-off-red text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Share on Farcaster
      </button>
    </div>
  );
}