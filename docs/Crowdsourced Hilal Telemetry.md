Feature Specification: Crowdsourced Hilal Telemetry ("I Saw It")1. Feature OverviewThis feature allows users on the mobile web or native app to report a sighting of the new crescent moon in real-time. This creates a live "ground truth" dataset that will visually populate the dashboard and serve as the foundational training data for future machine learning models.2. User Experience (UX) FlowTo maximise reporting, the UX must be frictionless, similar to LastQuake, but tailored to astronomical observation.Step 1: Geolocation & Time Lock: The moment the user taps "Report Sighting," the app silently captures GPS coordinates, elevation, and the exact UTC timestamp.Step 2: Sighting Type Selection (Triage):"Naked Eye" (Unaided)"Binoculars""Telescope""CCD / Camera""Attempted, but not seen" (Negative data is just as vital for ML training).Step 3: Device Orientation Capture (Optional but powerful): Before submission, the app reads the device's compass and gyroscope. If the user is facing East at sunset, the report is instantly flagged as erroneous.Step 4: Image Upload (Optional): Allow users to upload a photo, which can later be run through computer vision algorithms to verify the crescent.3. The Validation Engine (Python / FastAPI)This is where your data architecture background shines. You cannot simply display all user reports on the map, as this will lead to misinformation. You must implement a deterministic validation layer in your Python backend before committing the data.When a POST /api/reports payload is received:Astronomical Veto: The FastAPI backend instantly passes the user's GPS coordinates and timestamp to the Skyfield engine.Calculate $q$ and $V$: The engine calculates the Yallop $q$ and Odeh $V$ values for that specific coordinate.The Danjon Limit Check: If the calculated elongation (Arc of Light) is less than ~7 degrees, or $q$ is heavily negative (Zone F - Impossible), the system automatically flags the report as a "High-Probability False Positive" (e.g., they likely saw Venus or an optical illusion).Meteorological Snap: The backend triggers a background task to fetch the real-time cloud cover ($F$) and Aerosol Optical Depth (AOD) for that exact coordinate from Tomorrow.io/OpenWeather APIs, appending it to the database record.4. SQL Data ArchitectureTo support future analysis and ML modelling in Python or R, the database schema must be rigorous.CREATE TABLE public.user_sightings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users, -- Nullable for anonymous reports
    
    -- Telemetry
    reported_at TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    elevation_m INTEGER,
    device_azimuth DECIMAL(5,2), -- Where were they looking?
    
    -- Observation Details
    observation_method VARCHAR(50) NOT NULL, -- 'NAKED_EYE', 'TELESCOPE', etc.
    was_seen BOOLEAN NOT NULL,
    
    -- Backend Appended Data (The Validation Layer)
    calc_arc_vision DECIMAL(6,3),
    calc_arc_light DECIMAL(6,3),
    calc_yallop_q DECIMAL(5,3),
    weather_cloud_fraction DECIMAL(3,2),
    weather_aod DECIMAL(4,3),
    
    -- Trust & Moderation
    confidence_score DECIMAL(3,2) DEFAULT 0.0, -- Algorithmically generated
    is_verified BOOLEAN DEFAULT FALSE
);

-- Essential for spatial queries on the dashboard map
CREATE INDEX idx_sightings_geo ON public.user_sightings USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
CREATE INDEX idx_sightings_time ON public.user_sightings (reported_at);
5. Visualising on the DashboardOnce validated (e.g., confidence_score > 0.7), these reports appear on the MapLibre dashboard.Green Pins: Verified naked-eye sightings.Blue Pins: Verified optical aid sightings.Grey Pins: Negative reports ("Attempted, not seen").Heatmap Layer: A clustering layer showing areas with high concentrations of positive reports, overlaid directly on top of the theoretical Yallop probability bands.

## 6. Next Steps: Open-Meteo Integration
To accurately validate user sighting reports, we will integrate the **Open-Meteo API** as our free, unified data source for environmental and atmospheric conditions.
- **Digital Elevation Models (DEM):** Fetch the exact altitude of the observer's horizon. This allows adjusting the `arc of vision` to ensure the crescent isn't obscured by local mountains.
- **Aerosol Optical Depth (AOD) & Cloud Cover:** Query real-time atmospheric data at the exact time of sunset for the reported coordinate. Heavy pollution (high AOD) or cloud cover will negatively scale the $q$-value and immediately flag a report as "Suspicious" if the user claims a naked-eye sighting through a dense cloud bank.