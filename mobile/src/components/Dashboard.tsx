import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { WellBottomSheet } from './WellBottomSheet';

interface Well {
  id: string;
  name: string;
  status: 'normal' | 'warning' | 'critical';
  lastReading: {
    temperature: number;
    pressure: number;
    timestamp: number;
  };
  readings: Array<{
    temperature: number;
    pressure: number;
    timestamp: number;
  }>;
}

function WellCard({ well }: { well: Well }) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const isNegativeTemp = well.lastReading.temperature > 80;
  const isNegativePressure = well.lastReading.pressure > 2300;
  
  return (
    <>
      <div 
        className="bg-dark-surface rounded-lg border border-dark-surface-2 p-5 hover:border-dark-text-secondary/20 transition-colors cursor-pointer"
        onClick={() => setIsBottomSheetOpen(true)}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-dark-surface-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-dark-text">{well.name}</h3>
              <p className="text-dark-text-secondary text-sm">ID: {well.id}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            well.status === 'critical' ? 'bg-off-red/10 text-off-red' :
            well.status === 'warning' ? 'bg-saffron/10 text-saffron' :
            'bg-green-500/10 text-green-500'
          }`}>
            {well.status.charAt(0).toUpperCase() + well.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold text-dark-text">
                {well.lastReading.temperature.toFixed(1)}°F
              </span>
              <span className={`text-sm ${isNegativeTemp ? 'text-off-red' : 'text-green-500'}`}>
                {isNegativeTemp ? '↑' : '↓'} {Math.abs(80 - well.lastReading.temperature).toFixed(1)}°
              </span>
            </div>
            <p className="text-dark-text-secondary text-sm mt-1">Temperature</p>
          </div>
          
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold text-dark-text">
                {well.lastReading.pressure.toFixed(0)}
              </span>
              <span className={`text-sm ${isNegativePressure ? 'text-off-red' : 'text-green-500'}`}>
                {isNegativePressure ? '↑' : '↓'} {Math.abs(2300 - well.lastReading.pressure).toFixed(0)}
              </span>
            </div>
            <p className="text-dark-text-secondary text-sm mt-1">Pressure (PSI)</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-dark-surface-2 text-sm text-dark-text-secondary">
          Last updated: {new Date(well.lastReading.timestamp).toLocaleString()}
        </div>
      </div>
      
      <WellBottomSheet 
        well={well}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
    </>
  );
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('watchlist');
  const [wells] = useState<Well[]>([
    {
      id: 'W123',
      name: 'Well 123',
      status: 'normal',
      lastReading: {
        temperature: 75.4,
        pressure: 2150,
        timestamp: Date.now()
      },
      readings: []
    },
    {
      id: 'W456',
      name: 'Well 456',
      status: 'warning',
      lastReading: {
        temperature: 82.1,
        pressure: 2300,
        timestamp: Date.now() - 1800000
      },
      readings: []
    },
    {
      id: 'W789',
      name: 'Well 789',
      status: 'critical',
      lastReading: {
        temperature: 89.5,
        pressure: 2450,
        timestamp: Date.now() - 3600000
      },
      readings: []
    }
  ]);

  return (
    <div className="min-h-screen bg-dark-bg font-ubuntu text-dark-text">
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-surface border-b border-dark-surface-2">
        <div className="h-14 bg-dark-surface" />
        
        <div className="py-4 px-6 flex justify-between items-center">
          <div className="w-10" />
          <img 
            src="https://cdn.discordapp.com/attachments/1299199186625101865/1307488641592983592/EOG_Resources_logo-removebg-preview.png?ex=673a7d30&is=67392bb0&hm=72202b5fafbcb048029d2e407106cc2e0427f46e67b10a71ee8793ae4f3fe577&" 
            alt="EOG Resources Logo" 
            className="h-12 w-auto object-contain mix-blend-screen"
          />
          <button 
            className="bg-dark-surface-2 hover:bg-dark-surface/80 transition-colors rounded-full p-2"
            aria-label="Add Well"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-6 h-6 text-dark-text"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 4.5v15m7.5-7.5h-15" 
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="px-6 py-6 mt-32 mb-24">
        {activeTab === 'watchlist' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-medium text-dark-text">Well Watchlist</h2>
              <p className="text-dark-text-secondary mt-1">Monitor your active wells</p>
            </div>
            <div className="space-y-4">
              {wells.map(well => (
                <WellCard key={well.id} well={well} />
              ))}
            </div>
          </>
        )}
        
        {activeTab === 'chart' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium text-dark-text">Charts Coming Soon</h2>
            <p className="text-dark-text-secondary mt-2">Visual analytics for your wells</p>
          </div>
        )}
        
        {activeTab === 'explore' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium text-dark-text">Explore Wells</h2>
            <p className="text-dark-text-secondary mt-2">Discover and add new wells</p>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}