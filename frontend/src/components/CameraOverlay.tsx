import { useEffect, useRef, useState } from "react";

interface CameraOverlayProps {
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraOverlay: React.FC<CameraOverlayProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e: any) {
        setError('Camera not available. Use gallery or drag an image.');
      }
    })();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.9);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) { onCapture(f); onClose(); }
  };

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) { onCapture(f); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-3 flex items-center justify-between border-b border-border">
          <div className="font-semibold text-sm">Scan bill</div>
          <button onClick={onClose} className="text-sm">✕</button>
        </div>
        <div className="p-3 space-y-3">
          {error ? (
            <div className="text-xs text-muted-foreground">{error}</div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
              <button onClick={captureFrame} className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white text-black w-14 h-14 shadow">●</button>
            </div>
          )}

          <div
            onDragOver={(e)=>{e.preventDefault();}}
            onDrop={onDrop}
            className="border border-dashed border-border rounded-xl p-3 text-xs text-muted-foreground text-center"
          >
            Drag & drop an image here
          </div>
          <div className="text-center">
            <label className="text-xs underline cursor-pointer">
              Choose from gallery
              <input type="file" accept="image/*" className="hidden" onChange={onPick} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraOverlay;