import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, CheckCircle2, Upload, Camera } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUser, SignInButton } from "@clerk/clerk-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { AutoDetectButton } from "@/components/AutoDetectButton";
import * as EXIF from "exif-js";

export function SightingReportForm({ onSuccess }: { onSuccess?: () => void }) {
    const { isSignedIn } = useUser();
    const [submitted, setSubmitted] = useState(false);
    const geo = useGeolocation();

    // Form state
    const [lat, setLat] = useState<number | "">("");
    const [lng, setLng] = useState<number | "">("");
    const [observationTime, setObservationTime] = useState(
        new Date().toISOString().slice(0, 16) // YYYY-MM-DDThh:mm for datetime-local
    );
    const [visualSuccess, setVisualSuccess] = useState<"naked_eye" | "optical_aid" | "not_seen" | "">("");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoName, setPhotoName] = useState("");

    // EXIF Extraction
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoName(file.name);

        EXIF.getData(file as any, function (this: any) {
            const exifData = EXIF.getAllTags(this);

            // Extract GPS
            const latRaw = EXIF.getTag(this, "GPSLatitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef");
            const lngRaw = EXIF.getTag(this, "GPSLongitude");
            const lngRef = EXIF.getTag(this, "GPSLongitudeRef");

            if (latRaw && lngRaw) {
                const convertToDecimal = (gpsData: number[], ref: string) => {
                    const degrees = gpsData[0];
                    const minutes = gpsData[1];
                    const seconds = gpsData[2];
                    let decimal = degrees + minutes / 60 + seconds / 3600;
                    if (ref === "S" || ref === "W") decimal = decimal * -1;
                    return decimal;
                };

                const latDec = convertToDecimal(latRaw, latRef || "N");
                const lngDec = convertToDecimal(lngRaw, lngRef || "E");

                setLat(latDec);
                setLng(lngDec);
                setErrors(e => ({ ...e, lat: "", lng: "" }));
            } else {
                setErrors(e => ({ ...e, exif: "No GPS data found in image EXIF." }));
            }

            // Extract Timestamp (DateTimeOriginal: "YYYY:MM:DD HH:MM:SS")
            const dateTime = EXIF.getTag(this, "DateTimeOriginal");
            if (dateTime) {
                try {
                    // Convert "2024:03:10 18:45:00" to "2024-03-10T18:45:00"
                    const parts = dateTime.split(" ");
                    const dateParts = parts[0].split(":");
                    const formatted = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${parts[1].slice(0, 5)}`;
                    setObservationTime(formatted);
                    setErrors(e => ({ ...e, observationTime: "" }));
                } catch (err) {
                    console.warn("Could not parse EXIF DateTime:", dateTime);
                }
            }
        });
    };

    const submitMutation = trpc.telemetry.submitObservation.useMutation({
        onSuccess: () => {
            setSubmitted(true);
            setTimeout(() => {
                onSuccess?.();
            }, 2000);
        }
    });

    // Apply GPS detection result
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
        });
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-medium">Report Submitted!</h3>
                <p className="text-sm text-muted-foreground">
                    Thank you for your contribution. Your observation has been logged and will be used to calibrate the predictive models.
                </p>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                    You must be signed in to submit a sighting report. This helps us ensure data quality and avoid spam.
                </p>
                <SignInButton mode="modal">
                    <Button size="lg" className="w-full">Sign in to Report</Button>
                </SignInButton>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Upload Photo (Optional)</Label>
                <div className="flex gap-2 items-center">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center border-dashed"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        {photoName ? photoName : "Upload Photo & Extract Location"}
                    </Button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handlePhotoUpload}
                    />
                </div>
                {errors.exif && (
                    <p className="text-xs text-yellow-500 mt-1">{errors.exif}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">If available, EXIF metadata will automatically fill the location and time.</p>
            </div>

            <div className="space-y-2">
                <Label>Location Coordinates</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={lat}
                        onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                    <Input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={lng}
                        onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                </div>
                {(errors.lat || errors.lng) && (
                    <p className="text-xs text-destructive">Coordinates are required</p>
                )}
                <AutoDetectButton onClick={geo.detect} loading={geo.loading} variant="inline" />
            </div>

            <div className="space-y-2">
                <Label>Observation Time (Local)</Label>
                <Input
                    type="datetime-local"
                    value={observationTime}
                    onChange={(e) => setObservationTime(e.target.value)}
                />
                {errors.observationTime && (
                    <p className="text-xs text-destructive">{errors.observationTime}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Observation Result</Label>
                <Select onValueChange={(val: any) => { setVisualSuccess(val); setErrors(e => ({ ...e, visualSuccess: "" })); }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select outcome..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="naked_eye">Seen with Naked Eye</SelectItem>
                        <SelectItem value="optical_aid">Seen with Optical Aid (Binoculars/Telescope)</SelectItem>
                        <SelectItem value="not_seen">Attempted, but Not Seen</SelectItem>
                    </SelectContent>
                </Select>
                {errors.visualSuccess && (
                    <p className="text-xs text-destructive">{errors.visualSuccess}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Notes / Weather Details</Label>
                <Textarea
                    placeholder="E.g. Clear skies, slight haze on horizon..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none h-20"
                />
            </div>

            <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={submitMutation.isPending}
                style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                }}
            >
                {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Sighting
            </Button>

            <p className="text-[10px] text-muted-foreground text-center mt-4">
                Elevation and meteorological data (Cloud Cover, AOD) will be automatically fetched for your location via Open-Meteo.
            </p>
        </form>
    );
}
