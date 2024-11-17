import { useEffect, useState } from 'react';
import { WellChart } from './WellChart';
import { Well } from '../types/Well';
import { ChartData } from '../types/ChartData';

interface WellBottomSheetProps {
  well: Well;
  onClose: () => void;
  isOpen: boolean;
}

export function WellBottomSheet({ well, onClose, isOpen }: WellBottomSheetProps) {
  const [chartData, setChartData] = useState<ChartData[]>(() => {
    const data: ChartData[] = [];
    const now = Date.now();
    const baseTime = new Date(now).setHours(0, 0, 0, 0); 
    for (let i = 0; i < 24; i++) {
      const date = new Date(baseTime + i * 3600 * 1000); 
      data.push({
        time: Math.floor(date.getTime() / 1000), 
        value: Math.random() * 1000 + 2000,
      });
    }
    return data.sort((a, b) => Number(a.time) - Number(b.time));
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div 
        className={`fixed inset-x-0 bottom-0 bg-dark-surface z-50 rounded-t-3xl transform transition-transform duration-300 ease-out h-[75vh] ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{
          willChange: 'transform, opacity',
          transformOrigin: 'bottom'
        }}
      >
        <div className="sticky top-0 pt-3 pb-2 bg-dark-surface rounded-t-3xl">
          <div className="w-12 h-1 bg-dark-surface-2 rounded-full mx-auto" />
        </div>

        <div className="p-5 overflow-y-auto h-full pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-medium text-dark-text">{well.name}</h2>
              <p className="text-dark-text-secondary mt-1">ID: {well.id}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm ${
              well.status === 'critical' ? 'bg-off-red/10 text-off-red' :
              well.status === 'warning' ? 'bg-saffron/10 text-saffron' :
              'bg-green-500/10 text-green-500'
            }`}>
              {well.status.charAt(0).toUpperCase() + well.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-dark-surface-2 p-6 rounded-xl">
              <p className="text-dark-text-secondary text-sm">Temperature</p>
              <p className="text-3xl font-semibold text-dark-text mt-2">
                {well.lastReading.temperature.toFixed(1)}°F
              </p>
            </div>
            <div className="bg-dark-surface-2 p-6 rounded-xl">
              <p className="text-dark-text-secondary text-sm">Pressure</p>
              <p className="text-3xl font-semibold text-dark-text mt-2">
                {well.lastReading.pressure} PSI
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-dark-text mb-4">Pressure History</h3>
            <div className="bg-dark-surface-2 p-4 rounded-xl">
              <WellChart data={chartData} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-dark-surface-2 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-dark-text-secondary mb-2">Last Updated</h3>
              <p className="text-dark-text">
                {new Date(well.lastReading.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}