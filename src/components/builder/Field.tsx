"use client";
/**
 * Inspector field components — auto-generated from registry field defs.
 */
import React, { useRef, useState } from "react";
import type { FieldDef } from "@/lib/schema";
import { Icon, ICON_NAMES } from "@/components/site/icons";
import { ChevronDown, ChevronUp, Plus, Trash2, Upload } from "lucide-react";
import { CLOUD_STORAGE_LIMITS } from "@/lib/storage-limits";

interface FieldProps {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
}

export function FieldRow({ field, value, onChange }: FieldProps) {
  switch (field.kind) {
    case "textarea":
      return (
        <div>
          <label className="inspector-label">{field.label}</label>
          <textarea
            className="inspector-input min-h-[84px] resize-y"
            value={value ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "select":
      return (
        <div>
          <label className="inspector-label">{field.label}</label>
          <select
            className="inspector-input"
            value={String(value ?? field.options?.[0]?.value ?? "")}
            onChange={(e) => {
              const raw = e.target.value;
              const n = Number(raw);
              onChange(raw !== "" && !isNaN(n) && /^\d+$/.test(raw) ? n : raw);
            }}
          >
            {(field.options || []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "color":
      return (
        <div>
          <label className="inspector-label">{field.label}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-8 w-10 cursor-pointer rounded border border-[#e2def0]"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
            />
            <input
              className="inspector-input flex-1"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      );
    case "number":
      return (
        <div>
          <label className="inspector-label">{field.label}</label>
          <input
            type="number"
            className="inspector-input"
            value={value ?? ""}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );
    case "toggle":
      return (
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#e2def0] px-3 py-2.5">
          <span className="text-[12.5px] font-semibold text-[#3a3454]">{field.label}</span>
          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-[#6d5ae6]" : "bg-[#cfc9e2]"}`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? "left-[18px]" : "left-0.5"}`}
            />
          </span>
        </label>
      );
    case "image":
      return <ImageField label={field.label} value={value} onChange={onChange} />;
    case "icon":
      return <IconField label={field.label} value={value} onChange={onChange} />;
    case "code":
      return (
        <div>
          <label className="inspector-label">{field.label}</label>
          <textarea
            className="inspector-input min-h-[120px] font-mono text-[11.5px]"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.help ? <p className="mt-1 text-[11px] text-[#8d85ab]">{field.help}</p> : null}
        </div>
      );
    case "list":
      return (
        <ListField field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />
      );
    default:
      return (
        <div>
          <label className="inspector-label">{field.label}</label>
          <input
            className="inspector-input"
            value={value ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.help ? <p className="mt-1 text-[11px] text-[#8d85ab]">{field.help}</p> : null}
        </div>
      );
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("This image could not be read."));
    reader.onerror = () => reject(new Error("This image could not be read."));
    reader.readAsDataURL(blob);
  });
}

async function compressUploadedImage(file: File): Promise<string> {
  if (file.size > CLOUD_STORAGE_LIMITS.uploadInputBytes) {
    throw new Error("Choose an image smaller than 10 MB before compression.");
  }
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    throw new Error("Upload a static JPG, PNG, WebP or AVIF image. SVG and animated GIF uploads are not supported.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const baseScale = Math.min(1, 1600 / bitmap.width, 1600 / bitmap.height);
    for (const scaleStep of [1, 0.85, 0.7, 0.55]) {
      const width = Math.max(1, Math.round(bitmap.width * baseScale * scaleStep));
      const height = Math.max(1, Math.round(bitmap.height * baseScale * scaleStep));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not process this image.");
      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of [0.82, 0.72, 0.62, 0.52]) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
        if (blob && blob.size <= CLOUD_STORAGE_LIMITS.compressedImageBytes) return blobToDataUrl(blob);
      }
    }
    throw new Error("This image is still too large after compression. Try a smaller image.");
  } finally {
    bitmap.close();
  }
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  return (
    <div>
      <label className="inspector-label">{label}</label>
      <div className="flex items-center gap-2">
        <div className="h-10 w-14 flex-none overflow-hidden rounded-md border border-[#e2def0] bg-[#f7f5fd]">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <input
          className="inspector-input flex-1"
          value={value ?? ""}
          placeholder="Paste image URL or upload"
          onChange={(e) => { setUploadError(""); onChange(e.target.value); }}
        />
      </div>
      <div className="mt-1.5 flex gap-2">
        <button type="button" className="btn-app ghost !px-2.5 !py-1 !text-[11.5px]" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload size={12} /> {uploading ? "Compressing…" : "Upload image"}
        </button>
        {value ? (
          <button type="button" className="btn-app ghost !px-2.5 !py-1 !text-[11.5px]" onClick={() => { setUploadError(""); onChange(""); }}>
            Clear
          </button>
        ) : null}
      </div>
      {uploadError ? <p className="field-image-upload-error" role="alert">{uploadError}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setUploadError("");
          setUploading(true);
          void compressUploadedImage(file)
            .then((dataUrl) => onChange(dataUrl))
            .catch((error: unknown) => setUploadError(error instanceof Error ? error.message : "This image could not be compressed."))
            .finally(() => setUploading(false));
        }}
      />
    </div>
  );
}

function IconField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="inspector-label">{label}</label>
      <button
        type="button"
        className="inspector-input flex items-center gap-2 text-left"
        onClick={() => setOpen(!open)}
      >
        <Icon name={value || "Sparkles"} size={16} /> {value || "Choose an icon"}
      </button>
      {open ? (
        <div className="mt-2 grid max-h-52 grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-[#e2def0] p-2">
          {ICON_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              title={n}
              className={`grid h-8 place-items-center rounded-md hover:bg-[#efedfc] ${value === n ? "bg-[#e9e5fb] text-[#6d5ae6]" : ""}`}
              onClick={() => {
                onChange(n);
                setOpen(false);
              }}
            >
              <Icon name={n} size={15} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ListField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any[];
  onChange: (v: any[]) => void;
}) {
  const itemFields = field.itemFields || [];
  const makeItem = () => {
    const it: Record<string, any> = {};
    for (const f of itemFields) {
      it[f.key] = f.kind === "list" ? [] : f.kind === "number" ? 1 : f.kind === "toggle" ? false : "";
    }
    return it;
  };

  const setItem = (i: number, key: string, v: any) => {
    const next = value.map((it, idx) => (idx === i ? { ...it, [key]: v } : it));
    onChange(next);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <label className="inspector-label">{field.label}</label>
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg border border-[#e2def0] bg-[#fbfaff] p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8d85ab]">
                {(item && (item.name || item.title || item.label || item.q)) || `${field.label.slice(0, -1) || "Item"} ${i + 1}`}
              </span>
              <span className="flex gap-0.5">
                <button type="button" className="rounded p-1 text-[#8d85ab] hover:bg-[#efedfc] hover:text-[#6d5ae6]" onClick={() => move(i, -1)} aria-label="Move up">
                  <ChevronUp size={13} />
                </button>
                <button type="button" className="rounded p-1 text-[#8d85ab] hover:bg-[#efedfc] hover:text-[#6d5ae6]" onClick={() => move(i, 1)} aria-label="Move down">
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  className="rounded p-1 text-[#c0392b] hover:bg-[#fdecea]"
                  aria-label="Delete"
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                >
                  <Trash2 size={13} />
                </button>
              </span>
            </div>
            <div className="space-y-2">
              {itemFields.map((f) => (
                <FieldRow
                  key={f.key}
                  field={f}
                  value={item?.[f.key]}
                  onChange={(v) => setItem(i, f.key, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn-app ghost mt-2 w-full !border-dashed !py-1.5 !text-[12px]"
        onClick={() => onChange([...value, makeItem()])}
      >
        <Plus size={13} /> {field.addLabel || "Add item"}
      </button>
    </div>
  );
}
