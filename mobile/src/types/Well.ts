export interface Well {
  id: string;
  name: string;
  status: 'critical' | 'warning' | 'normal';
  lastReading: {
    temperature: number;
    pressure: number;
    timestamp: number;
  };
  readings: {
    timestamp: string | number;
    pressure: number;
  }[];
}