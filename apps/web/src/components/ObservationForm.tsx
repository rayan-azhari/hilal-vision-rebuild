"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, CheckCircle2, Upload, Camera } from "lucide-react";
import { trpc } from "@/server/trpc";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useGeolocation } from "@/hooks/useGeolocation";
import { AutoDetectButton } from "@/components/AutoDetectButton";
import { parse as parseExif } from "exifr";

export function ObservationForm({ onSuccess }: { onSuccess?: () => void }) {
    const { isSignedIn } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const geo = useGeolocation();

    const [lat, setLat] = useState<number | "">("");
    const [lng, setLng] = useState<number | "">("");
    const [observationTime, setObservationTime] = useState(
        new Date().toISOString().slice(0, 16)
    );
    const [visualSuccess, setVisualSuccess] = useState<"naked_eye" | "optical_aid" | "not_seen" | "">("");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoName, setPhotoName] = useState("");
    const [imageBase64, setImageBase64] = useState<string>("");

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoName(file.name);

        const reader = new FileReader();
        reader.onloadend = () => setImageBase64(reader.result as string);
        reader.readAsDataURL(file);

        try {
            const exif = await parseExif(file, { gps: true, tiff: true, exif: true, ifd0: true } as any);
            if (!exif) {
                setErrors((p) => ({ ...p, exif: "No EXIF data found in image." }));
                return;
            }

            if (exif.latitude != null && exif.longitude != null) {
                setLat(exif.latitude);
                setLng(exif.longitude);
                setErrors((p) => ({ ...p, lat: "", lng: "" }));
            }

            if (exif.DateTimeOriginal instanceof Date) {
                const d = exif.DateTimeOriginal;
                const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                setObservationTime(formatted);
                setErrors((p) => ({ ...p, observationTime: "" }));
            }
        } catch (err) {
            console.warn("EXIF extraction failed:", err);
            setErrors((p) => ({ ...p, exif: "Could not read image metadata." }));
        }
    };

    const submitMutation = trpc.telemetry.submitObservation.useMutation({
        onSuccess: () => {
            setSubmitted(true);
            setTimeout(() => onSuccess?.(), 2000);
        }
    });

    useEffect(() => {
        if (geo.position) {
            setLat(geo.position.lat);
            setLng(geo.position.lng);
            setErrors((e) => ({ ...e, lat: "", lng: "" }));
        }
    }, [geo.position]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (lat === "" || isNaN(Number(lat))) newErrors.lat = "Latitude is required";
        if (lng === "" || isNaN(Number(lng))) newErrors.lng = "Longitude is required";
        if (!observationTime) newErrors.observationTime = "Observation time is required";
        if (!visualSuccess) newErrors.visualSuccess = "Please select an observation result";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        submitMutation.mutate({
            lat: Number(lat),
            lng: Number(lng),
            observationTime: new Date(observationTime).toISOString(),
            visualSuccess: visualSuccess as "naked_eye" | "optical_aid" | "not_seen",
            notes: notes || undefined,
            imageBase64: imageBase64 || undefined,
        });
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--gold) 15%, transparent)" }}>
                    <CheckCircle2 className="w-6 h-6" style={{ color: "var(--gold)" }} />
                </div>
                <h3 className="text-lg font-display font-medium text-foreground">Report Submitted!</h3>
                <p className="text-sm text-foreground/70">
                    Thank you for your contribution. Your observation helps calibrate our predictive models.
                </p>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <MapPin className="w-10 h-10 text-foreground/20" />
                <div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Sign in to report</h3>
                    <p className="text-sm text-foreground/60 max-w-[250px]">
                        Crowdsourced reporting is restricted to verified accounts to maintain data quality.
                    </p>
                </div>
                <SignInButton mode="modal">
                    <button className="px-5 py-2.5 rounded-xl text-sm font-semibold mt-2" style={{ background: "var(--gold)", color: "var(--primary-foreground)" }}>
                        Sign In Now
                    </button>
                </SignInButton>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground border-b border-foreground/10 pb-2">Where did you observe from?</h4>
                <div className="grid grid-cols-2 gap-4 relative">
                    <div>
                        <label className="text-xs font-medium text-foreground/60 tracking-wide uppercase mb-1.5 block">Latitude</label>
                        <input
                            type="number"
                            step="any"
                            value={lat}
                            onChange={(e) => setLat(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 21.389"
                            className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                            style={{ borderColor: errors.lat ? "var(--destructive)" : undefined }}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-foreground/60 tracking-wide uppercase mb-1.5 block">Longitude</label>
                        <input
                            type="number"
                            step="any"
                            value={lng}
                            onChange={(e) => setLng(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 39.857"
                            className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                            style={{ borderColor: errors.lng ? "var(--destructive)" : undefined }}
                        />
                    </div>
                </div>
                {geo.isLoading ? (
                    <div className="text-xs text-foreground/40 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Detect location...</div>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            if (geo.position) {
                                setLat(geo.position.lat); setLng(geo.position.lng); setErrors((e) => ({ ...e, lat: "", lng: "" }));
                            }
                        }}
                        className="text-xs text-gold flex items-center gap-1.5 hover:underline"
                    >
                        <MapPin className="w-3.5 h-3.5" /> Use my current location
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground border-b border-foreground/10 pb-2">Observation Details</h4>
                <div>
                    <label className="text-xs font-medium text-foreground/60 tracking-wide uppercase mb-1.5 block">Date & Local Time</label>
                    <input
                        type="datetime-local"
                        value={observationTime}
                        onChange={(e) => setObservationTime(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                        style={{ borderColor: errors.observationTime ? "var(--destructive)" : undefined }}
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-foreground/60 tracking-wide uppercase mb-3 block">Did you see the crescent?</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { id: "naked_eye", label: "Yes, naked eye", desc: "Easily visible without aid", color: "var(--accent)" },
                            { id: "optical_aid", label: "Yes, optical aid", desc: "Used binoculars/telescope", color: "var(--gold)" },
                            { id: "not_seen", label: "No, not seen", desc: "Looked but couldn't find it", color: "var(--muted-foreground)" }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setVisualSuccess(opt.id as any)}
                                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-center"
                                style={{
                                    borderColor: visualSuccess === opt.id ? opt.color : "var(--border)",
                                    background: visualSuccess === opt.id ? `color-mix(in oklch, ${opt.color} 5%, transparent)` : "transparent",
                                    color: visualSuccess === opt.id ? opt.color : "var(--foreground)"
                                }}
                            >
                                <span className="font-semibold text-sm mb-1">{opt.label}</span>
                                <span className="text-[10px] opacity-70 leading-tight">{opt.desc}</span>
                            </button>
                        ))}
                    </div>
                    {errors.visualSuccess && <p className="text-xs text-destructive mt-2">{errors.visualSuccess}</p>}
                </div>

                <div className="bg-foreground/5 rounded-xl p-4 border border-border border-dashed">
                    <label className="text-xs font-medium text-foreground mb-2 block flex items-center justify-between">
                        <span>Attach Photo (Optional)</span>
                        {photoName && <span className="text-gold truncate max-w-[150px]">{photoName}</span>}
                    </label>
                    <p className="text-[11px] text-foreground/60 mb-3 leading-relaxed">
                        If you took a photo, upload it here. We will attempt to automatically extract the precise GPS coordinates and time from the image metadata.
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-2 bg-background border border-border px-3 py-2 rounded-lg text-xs font-medium hover:bg-foreground/5 transition-colors"
                        >
                            <Upload className="w-3.5 h-3.5" /> Select Image
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                        />
                    </div>
                    {errors.exif && <p className="text-xs text-destructive mt-2">{errors.exif}</p>}
                </div>

                <div>
                    <label className="text-xs font-medium text-foreground/60 tracking-wide uppercase mb-1.5 block">Additional Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Weather conditions, cloud cover, atmospheric clarity..."
                        className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[80px] resize-y"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full flex items-center justify-center p-3 rounded-xl font-bold transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                style={{ background: "var(--accent)", color: "var(--primary-foreground)" }}
            >
                {submitMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    "Submit Sighting Report"
                )}
            </button>
        </form>
    );
}
