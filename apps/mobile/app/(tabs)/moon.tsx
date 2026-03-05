import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MoonScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Moon Phase</Text>
            <Text style={styles.subtitle}>
                A native 3D globe (expo-gl) and Ephemeris data will be rendered here.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    title: {
        fontSize: 28,
        color: "#F8FAFC",
        fontWeight: "600",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#94A3B8",
        textAlign: "center",
    },
});
