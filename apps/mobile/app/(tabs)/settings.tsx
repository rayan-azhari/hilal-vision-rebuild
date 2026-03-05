import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.replace("/(auth)/sign-in");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            {user ? (
                <View style={styles.card}>
                    <Text style={styles.label}>Account</Text>
                    <Text style={styles.value}>{user.emailAddresses[0]?.emailAddress}</Text>
                    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.subtitle}>Not signed in.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
        padding: 24,
    },
    title: {
        fontSize: 28,
        color: "#F8FAFC",
        fontWeight: "600",
        marginBottom: 24,
    },
    subtitle: {
        color: "#94A3B8",
        fontSize: 16,
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    label: {
        color: "#94A3B8",
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        color: "#F8FAFC",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#EF4444",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#F8FAFC",
        fontWeight: "bold",
    },
});
