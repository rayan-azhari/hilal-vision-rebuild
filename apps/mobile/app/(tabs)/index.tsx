import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hilal Vision (Mobile)</Text>
      <Text style={styles.subtitle}>
        Sign in to view real-time Moon tracking & Crescent Visibility.
      </Text>
      <Link href="/(auth)/sign-in" style={styles.button}>
        Sign In
      </Link>
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
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#FACC15",
    color: "#0F172A",
    fontWeight: "bold",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
});
