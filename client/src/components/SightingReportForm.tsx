import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    lat: z.number(),
    lng: z.number(),
    observationTime: z.string(),
    visualSuccess: z.enum(["naked_eye", "optical_aid", "not_seen"]),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SightingReportForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLocating, setIsLocating] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const submitMutation = trpc.telemetry.submitObservation.useMutation({
        onSuccess: () => {
            setSubmitted(true);
            setTimeout(() => {
                onSuccess?.();
            }, 2000);
        }
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            observationTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDThh:mm format for datetime-local
        }
    });

    const lat = watch("lat");
    const lng = watch("lng");

    const handleGetLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setValue("lat", position.coords.latitude, { shouldValidate: true });
                    setValue("lng", position.coords.longitude, { shouldValidate: true });
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Could not get your location. Please check permissions.");
                    setIsLocating(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
            setIsLocating(false);
        }
    };

    const onSubmit = (data: FormValues) => {
        submitMutation.mutate({
            ...data,
            // Convert browser datetime-local back to proper ISO string
            observationTime: new Date(data.observationTime).toISOString(),
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Location Coordinates</Label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        {...register("lat", { valueAsNumber: true })}
                    />
                    <Input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        {...register("lng", { valueAsNumber: true })}
                    />
                </div>
                {(errors.lat || errors.lng) && (
                    <p className="text-xs text-destructive">Coordinates are required</p>
                )}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                >
                    {isLocating ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <MapPin className="w-3 h-3 mr-2" />}
                    Auto-detect Location
                </Button>
            </div>

            <div className="space-y-2">
                <Label>Observation Time (Local)</Label>
                <Input
                    type="datetime-local"
                    {...register("observationTime")}
                />
                {errors.observationTime && (
                    <p className="text-xs text-destructive">{errors.observationTime.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Observation Result</Label>
                <Select onValueChange={(val: any) => setValue("visualSuccess", val, { shouldValidate: true })}>
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
                    <p className="text-xs text-destructive">{errors.visualSuccess.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Notes / Weather Details</Label>
                <Textarea
                    placeholder="E.g. Clear skies, slight haze on horizon..."
                    {...register("notes")}
                    className="resize-none h-20"
                />
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={submitMutation.isPending}
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
