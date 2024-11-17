import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        console.log('Rendering chart:', chart);

        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
        });

        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = '';
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          try {
            const { svg } = await mermaid.render(id, chart);
            mermaidRef.current.innerHTML = svg;
          } catch (renderError) {
            console.error('Mermaid render error:', renderError);
            mermaidRef.current.innerHTML = `
              <div class="text-pink p-4 rounded-lg bg-pink/10">
                Failed to render diagram. Please check the syntax.
                <pre class="mt-2 text-xs">${chart}</pre>
              </div>
            `;
          }
        }
      } catch (err) {
        console.error('Error in renderDiagram:', err);
      }
    };

    renderDiagram();
  }, [chart]);

  return <div ref={mermaidRef} className="w-full" />;
}