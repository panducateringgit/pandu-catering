import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type Props = {
  file: File | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
  busy?: boolean;
};

const ASPECTS: Record<string, number | undefined> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  free: undefined,
};

// Long edge cap so uploaded photos stay under ~1MB without losing quality.
const MAX_EDGE = 2000;

async function cropToBlob(fileUrl: string, area: Area, mime: string): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = fileUrl;
  });
  const scale = Math.min(1, MAX_EDGE / Math.max(area.width, area.height));
  const w = Math.round(area.width * scale);
  const h = Math.round(area.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      mime === "image/png" ? "image/png" : "image/jpeg",
      0.9,
    );
  });
}

export function CropDialog({ file, onCancel, onConfirm, busy }: Props) {
  const [aspectKey, setAspectKey] = useState<keyof typeof ASPECTS>("1:1");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const url = file ? URL.createObjectURL(file) : "";

  const onComplete = useCallback((_: Area, px: Area) => setPixels(px), []);

  const confirm = async () => {
    if (!file || !pixels) return;
    const blob = await cropToBlob(url, pixels, file.type);
    await onConfirm(blob);
  };

  return (
    <Dialog open={!!file} onOpenChange={(o) => !o && !busy && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop & resize</DialogTitle>
        </DialogHeader>
        {file && (
          <div className="grid gap-4">
            <div className="relative h-[360px] w-full overflow-hidden rounded-lg bg-black">
              <Cropper
                image={url}
                crop={crop}
                zoom={zoom}
                aspect={ASPECTS[aspectKey]}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onComplete}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Aspect ratio</Label>
                <Select value={aspectKey} onValueChange={(v) => setAspectKey(v as keyof typeof ASPECTS)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square 1:1</SelectItem>
                    <SelectItem value="4:3">Landscape 4:3</SelectItem>
                    <SelectItem value="16:9">Wide 16:9</SelectItem>
                    <SelectItem value="free">Freeform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zoom</Label>
                <Slider min={1} max={4} step={0.05} value={[zoom]} onValueChange={(v) => setZoom(v[0])} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Resized to a maximum of {MAX_EDGE}px on the long edge before upload.</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button onClick={confirm} disabled={busy || !pixels}>
            {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
