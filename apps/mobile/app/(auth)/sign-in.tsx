import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMSG, setErrorMSG] = useState("");

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setErrorMSG("");
        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (completeSignIn.status === "complete") {
                await setActive({ session: completeSignIn.createdSessionId });
                router.replace("/(tabs)");
            } else {
                console.error(JSON.stringify(completeSignIn, null, 2));
            }
        } catch (err: any) {
            setErrorMSG(err.errors[0]?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your Hilal Vision account</Text>

                {errorMSG ? <Text style={styles.errorText}>{errorMSG}</Text> : null}

                <View style={styles.form}>
                    <TextInput
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Email Address"
                        placeholderTextColor="#94A3B8"
                        onChangeText={setEmailAddress}
                        style={styles.input}
                    />
                    <TextInput
                        value={password}
                        placeholder="Password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={true}
                        onChangeText={setPassword}
                        style={styles.input}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onSignInPress}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#0F172A" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "600",
        color: "#F8FAFC",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#94A3B8",
        marginBottom: 32,
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: 16,
        color: "#F8FAFC",
        fontSize: 16,
    },
    button: {
        backgroundColor: "#FACC15",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#0F172A",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        color: "#EF4444",
        marginBottom: 16,
    },
});
