import { createChart, ColorType, Time  } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { ChartData } from '../types/ChartData'; // Import the shared ChartData

interface WellChartProps {
  data: ChartData[];
}

export function WellChart({ data }: WellChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1E1E1E' },
        textColor: '#A0A0A0',
      },
      grid: {
        vertLines: { color: '#2C2C2C' },
        horzLines: { color: '#2C2C2C' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#F40000',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      priceFormat: {
        type: 'price',
        precision: 0,
      },
    });

    lineSeries.setData(
      data.map(item => ({
        time: item.time as Time,
        value: item.value,
      }))
    );

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} />;
}