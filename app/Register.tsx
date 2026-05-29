import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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
import { auth, db } from "../lib/firebase";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    password: "",
    fecha_nacimiento: "",
    sexo: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setError("");

    // Validaciones básicas
    if (!form.nombre || !form.apellido || !form.correo || !form.password) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (!form.sexo) {
      setError("Por favor selecciona un sexo.");
      return;
    }

    setLoading(true);
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.correo,
        form.password
      );
      const uid = userCredential.user.uid;

      // 2. Guardar datos adicionales en Firestore
      await setDoc(doc(db, "usuarios", uid), {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        correo: form.correo,
        fecha_nacimiento: form.fecha_nacimiento,
        sexo: form.sexo,
        creado_en: new Date().toISOString(),
      });

      // 3. Redirigir al login o a la app
      router.replace("/");
    } catch (e: any) {
      // Traducir errores comunes de Firebase
      if (e.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado.");
      } else if (e.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (e.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else {
        setError("Ocurrió un error al registrarse. Intenta de nuevo.");
      }
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.headerTitle}>
            Flujo de enfermería, cuidado continuo
          </Text>

          <View style={styles.card}>
            <SmallLogo />

            <FormField
              label="NOMBRE"
              placeholder="Ingresa tu nombre(s)"
              value={form.nombre}
              onChangeText={(v) => setField("nombre", v)}
            />
            <FormField
              label="APELLIDO"
              placeholder="Ingresa tus apellidos"
              value={form.apellido}
              onChangeText={(v) => setField("apellido", v)}
            />
            <FormField
              label="NÚMERO CELULAR O TELÉFONO"
              placeholder="Ingresa tu número de celular o teléfono"
              value={form.telefono}
              onChangeText={(v) => setField("telefono", v)}
              keyboardType="phone-pad"
            />
            <FormField
              label="CORREO"
              placeholder="Ingresa tu correo electrónico"
              value={form.correo}
              onChangeText={(v) => setField("correo", v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormField
              label="CONTRASEÑA"
              placeholder="Ingresa una contraseña"
              value={form.password}
              onChangeText={(v) => setField("password", v)}
              secureTextEntry
            />

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>FECHA DE NACIMIENTO</Text>
              <TextInput
                style={styles.input}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#9ab4c4"
                value={form.fecha_nacimiento}
                onChangeText={(v) => setField("fecha_nacimiento", v)}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.fieldWrapper}>
              <View style={styles.radioRow}>
                <RadioButton
                  label="Femenino"
                  selected={form.sexo === "Femenino"}
                  onPress={() => setField("sexo", "Femenino")}
                />
                <RadioButton
                  label="Masculino"
                  selected={form.sexo === "Masculino"}
                  onPress={() => setField("sexo", "Masculino")}
                />
              </View>
              <Text style={styles.fieldLabel}>SEXO</Text>
            </View>

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
                <Text style={styles.buttonText}>Registrarse</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.loginText}>
              ¿Ya tienes cuenta?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => router.replace("/login")}
              >
                Ingresar
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
  autoCapitalize = "words",
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

function RadioButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.radioOption} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
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
  radioRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 6,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9ab4c4",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#1a3a5c",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1a3a5c",
  },
  radioLabel: {
    fontSize: 14,
    color: "#374151",
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
  loginText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    marginTop: 16,
  },
  loginLink: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },
});