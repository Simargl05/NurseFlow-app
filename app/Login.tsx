import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../lib/firebase";

export default function LoginScreen() {
  const [form, setForm] = useState({ correo: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.correo,
        form.password
      );
      const user = userCredential.user;
      console.log("Usuario autenticado:", user.email);

      router.replace("/(tabs)/DashboardPage");
    } catch (err: any) {
      console.error("Error en login:", err);
      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.headerTitle}>NurseFlow, cuidado continuo</Text>

          <View style={styles.card}>
            <SmallLogo />

            <FormField
              label="CORREO"
              placeholder="Ingresa tu correo electrónico"
              value={form.correo}
              onChangeText={(v) => setForm((p) => ({ ...p, correo: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormField
              label="CONTRASEÑA"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.registerText}>
              ¿No tienes cuenta?{" "}
              <Text
                style={styles.registerLink}
                onPress={() => router.push("/Register")}
              >
                Registrarse
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9ab4c4"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

function SmallLogo() {
  return (
    <View style={styles.logoWrapper}>
      <Text style={styles.logoTitle}>NURSE FLOW</Text>
      <Text style={styles.logoSubtitle}>CUIDADO CONTINUO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#a8d5e2",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a3a5c",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a3a5c",
    letterSpacing: 2,
  },
  logoSubtitle: {
    fontSize: 9,
    color: "#5ba3b0",
    letterSpacing: 4,
    marginTop: 2,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#eef4f8",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1a3a5c",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  registerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    marginTop: 16,
  },
  registerLink: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },
});