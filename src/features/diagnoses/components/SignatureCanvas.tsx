import { useCallback, useEffect, useRef } from "react";
import styles from "./SignatureCanvas.module.css";

type Props = {
  value?: string;
  onChange: (dataUrl: string) => void;
};

export function SignatureCanvas({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = value;
  }, [value]);

  const pos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const r = canvas.getBoundingClientRect();
      const t =
        "touches" in e
          ? e.touches[0] ?? e.changedTouches[0]
          : e;
      if (!t) return { x: 0, y: 0 };
      const scaleX = canvas.width / r.width;
      const scaleY = canvas.height / r.height;
      return {
        x: (t.clientX - r.left) * scaleX,
        y: (t.clientY - r.top) * scaleY,
      };
    },
    []
  );

  const emit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }, [onChange]);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      drawing.current = true;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    },
    [pos]
  );

  const move = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      const p = pos(e);
      ctx.strokeStyle = "#2E7D32";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      emit();
    },
    [emit, pos]
  );

  const end = useCallback(() => {
    drawing.current = false;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }, [onChange]);

  return (
    <div>
      <div className={styles.wrap}>
        <canvas
          ref={canvasRef}
          width={400}
          height={160}
          className={styles.canvas}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <button type="button" onClick={clear} className={styles.clear}>
        Limpar assinatura
      </button>
    </div>
  );
}
