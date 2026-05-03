"use client";

import { useRef, useState } from "react";
import type { ResumeHeader } from "@/lib/resume/types";
import type { ResumeLabels } from "@/lib/resume/labels";
import type { HTMLAttributes } from "react";

type Props = {
  labels: ResumeLabels;
  header: ResumeHeader;
  showPhoto: boolean;
  showLinkedIn: boolean;
  showGithub: boolean;
  showPortfolio: boolean;
  onHeaderChange: (patch: Partial<ResumeHeader>) => void;
  onVisibilityChange: (patch: {
    showPhoto?: boolean;
    showLinkedIn?: boolean;
    showGithub?: boolean;
    showPortfolio?: boolean;
  }) => void;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url";
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-indigo-600"
      />
      <span>{label}</span>
    </label>
  );
}

export function ResumeHeaderForm({
  labels,
  header,
  showPhoto,
  showLinkedIn,
  showGithub,
  showPortfolio,
  onHeaderChange,
  onVisibilityChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);

  function hasValue(v: string | undefined): boolean {
    return Boolean(v && v.trim().length > 0);
  }

  function clearPhoto() {
    setPhotoMessage(null);
    onHeaderChange({ photoUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openFilePicker() {
    setPhotoMessage(null);
    fileInputRef.current?.click();
  }

  function onPickPhoto(file: File | null) {
    setPhotoMessage(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoMessage("Please choose an image file (PNG/JPG/WebP).");
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setPhotoMessage("Image is too large. Please choose a file up to 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setPhotoMessage("Could not read this file. Please try another image.");
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        setPhotoMessage("Could not read this file. Please try another image.");
        return;
      }

      onHeaderChange({ photoUrl: result });
      if (!showPhoto) onVisibilityChange({ showPhoto: true });
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white py-5 pr-5 pl-4 shadow-sm sm:py-6 sm:pr-6 sm:pl-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-slate-400"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{labels.header}</span>
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label={labels.fullName}
          value={header.fullName}
          onChange={(v) => onHeaderChange({ fullName: v })}
          placeholder="Jane Doe"
        />
        <Field
          label={labels.title}
          value={header.title}
          onChange={(v) => onHeaderChange({ title: v })}
          placeholder="Senior Frontend Engineer"
        />
        <Field
          label={labels.email}
          type="email"
          inputMode="email"
          value={header.email}
          onChange={(v) => onHeaderChange({ email: v })}
          placeholder="jane@example.com"
        />
        <Field
          label={labels.phone}
          type="tel"
          inputMode="tel"
          value={header.phone}
          onChange={(v) => onHeaderChange({ phone: v })}
          placeholder="+1 555 123 4567"
        />
        <Field
          label={labels.location}
          value={header.location}
          onChange={(v) => onHeaderChange({ location: v })}
          placeholder="Kyiv, Ukraine"
        />
        <div className="block">
          <div className="flex items-end justify-between gap-3">
            <div className="text-xs font-medium text-slate-600">{labels.photoUrl}</div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickPhoto(e.currentTarget.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={openFilePicker}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Upload
              </button>
              {hasValue(header.photoUrl) ? (
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
          <input
            type="url"
            inputMode="url"
            value={header.photoUrl ?? ""}
            onChange={(e) => {
              setPhotoMessage(null);
              onHeaderChange({ photoUrl: e.target.value });
            }}
            placeholder="https://... (or upload)"
            className="mt-1 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
          />
          {photoMessage ? (
            <div className="mt-2 text-xs text-rose-600">{photoMessage}</div>
          ) : null}
          {header.photoUrl?.startsWith("http") ? (
            <div className="mt-2 text-xs text-slate-500">
              Note: Some image hosts block PDF export due to CORS. Upload is the most reliable option.
            </div>
          ) : null}
        </div>
        <Field
          label={labels.linkedInUrl}
          type="url"
          inputMode="url"
          value={header.linkedIn ?? ""}
          onChange={(v) => onHeaderChange({ linkedIn: v })}
          placeholder="https://linkedin.com/in/..."
        />
        <Field
          label={labels.githubUrl}
          type="url"
          inputMode="url"
          value={header.github ?? ""}
          onChange={(v) => onHeaderChange({ github: v })}
          placeholder="https://github.com/..."
        />
        <div className="sm:col-span-2">
          <Field
            label={labels.portfolioUrl}
            type="url"
            inputMode="url"
            value={header.portfolio ?? ""}
            onChange={(v) => onHeaderChange({ portfolio: v })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        <Toggle
          label={labels.showPhoto}
          checked={showPhoto}
          onChange={(v) => onVisibilityChange({ showPhoto: v })}
        />
        <Toggle
          label={labels.showLinkedIn}
          checked={showLinkedIn}
          onChange={(v) => onVisibilityChange({ showLinkedIn: v })}
        />
        <Toggle
          label={labels.showGithub}
          checked={showGithub}
          onChange={(v) => onVisibilityChange({ showGithub: v })}
        />
        <Toggle
          label={labels.showPortfolio}
          checked={showPortfolio}
          onChange={(v) => onVisibilityChange({ showPortfolio: v })}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Tips: If a link is empty, it won’t be shown in the preview or PDF (even
        when enabled).
      </p>
    </section>
  );
}

