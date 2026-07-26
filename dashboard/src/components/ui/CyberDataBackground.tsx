import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

interface TelemetryText {
  x: number;
  y: number;
  text: string;
  speed: number;
  opacity: number;
}

export function CyberDataBackground({ 
  isInteractive = true, 
  theme = 'dark' 
}: { 
  isInteractive?: boolean;
  theme?: 'dark' | 'light';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isInteractive) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const isLight = theme === 'light';
    const colors = isLight 
      ? ['#007bff', '#17a2b8', '#0056b3', '#333333', '#666666']
      : ['#06b6d4', '#a855f7', '#10b981', '#3b82f6', '#0284c7'];

    const primaryRgb = isLight ? '0, 123, 255' : '34, 211, 238'; // Blue vs Cyan
    const secondaryRgb = isLight ? '0, 86, 179' : '168, 85, 247'; // Dark Blue vs Purple

    const nodeCount = Math.min(80, Math.floor((width * height) / 18000));
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    const codeSnippets = [
      '01100001 01101001', '0x7F4A_SEC', 'AI_ENGINE::OK', 'TENSOR_GRAPH_v4',
      'ACCURACY: 99.8%', 'MODEL_SYNC', '0x1A2B_PHISH', 'QUANTUM_HASH',
      'NEURAL_WEIGHTS', '10101100', 'CIPHER_VALID', 'VECTOR_EMBED',
    ];
    const telemetryTexts: TelemetryText[] = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
      speed: 0.2 + Math.random() * 0.4,
      opacity: isLight ? (0.1 + Math.random() * 0.2) : (0.08 + Math.random() * 0.15),
    }));

    let radarAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.4, 100,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.8
      );
      if (isLight) {
        gradient.addColorStop(0, 'rgba(240, 244, 248, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
      } else {
        gradient.addColorStop(0, 'rgba(8, 28, 54, 0.4)');
        gradient.addColorStop(0.5, 'rgba(5, 12, 26, 0.7)');
        gradient.addColorStop(1, 'rgba(3, 7, 18, 0.95)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = `rgba(${primaryRgb}, 0.05)`;
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      radarAngle += 0.005;
      const radarCenterX = width * 0.85;
      const radarCenterY = height * 0.2;
      const radarRadius = Math.min(width, height) * 0.35;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${primaryRgb}, 0.05)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const sweepGradient = ctx.createConicGradient(radarAngle, radarCenterX, radarCenterY);
      sweepGradient.addColorStop(0, `rgba(${primaryRgb}, 0.12)`);
      sweepGradient.addColorStop(0.1, `rgba(${primaryRgb}, 0.02)`);
      sweepGradient.addColorStop(0.2, 'rgba(0, 0, 0, 0)');
      sweepGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.arc(radarCenterX, radarCenterY, radarRadius, radarAngle, radarAngle + Math.PI * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.font = '10px "JetBrains Mono", monospace';
      telemetryTexts.forEach((t) => {
        t.y -= t.speed;
        if (t.y < -20) {
          t.y = height + 20;
          t.x = Math.random() * width;
          t.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        }
        ctx.fillStyle = `rgba(${primaryRgb}, ${t.opacity})`;
        ctx.fillText(t.text, t.x, t.y);
      });

      nodes.forEach((node, i) => {
        node.x += node.vx; node.y += node.vy; node.pulse += node.pulseSpeed;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x; const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * (isLight ? 0.3 : 0.22);
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(${primaryRgb}, ${alpha})`;
            ctx.lineWidth = 0.8; ctx.stroke();

            if (dist > 40 && Math.sin(node.pulse * 2) > 0.95) {
              const progress = (Math.sin(node.pulse * 3) + 1) / 2;
              const px = node.x + dx * progress; const py = node.y + dy * progress;
              ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${secondaryRgb}, 0.8)`;
              ctx.fill();
            }
          }
        }

        if (mouseRef.current.active) {
          const mdx = mouseRef.current.x - node.x; const mdy = mouseRef.current.y - node.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 180) {
            const malpha = (1 - mdist / 180) * 0.45;
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = `rgba(${secondaryRgb}, ${malpha})`;
            ctx.lineWidth = 1; ctx.stroke();
          }
        }

        const currentRadius = node.radius + Math.sin(node.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isInteractive, theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px'
        }}
      />
    </div>
  );
}
