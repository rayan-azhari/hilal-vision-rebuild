import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE, UrlTile } from "react-native-maps";

export default function MapScreen() {
    return (
        <View style={styles.container}>
            <MapView
                // provider={PROVIDER_GOOGLE}  // Use Google Maps if configured, otherwise Apple Maps on iOS
                style={styles.map}
                initialRegion={{
                    latitude: 21.4225,
                    longitude: 39.8262,
                    latitudeDelta: 60,
                    longitudeDelta: 60,
                }}
                mapType="terrain"
            >
                <UrlTile
                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                    zIndex={-1}
                />
                {/* Visibility Overlays will be injected dynamically here using GeoJSON/Polygons or custom tile overlays */}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
        alignItems: "center",
        justifyContent: "center",
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
});
