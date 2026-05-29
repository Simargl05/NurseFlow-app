import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../lib/firebase";

// ─── Mock data ─────────────────────────────────────────────────────────────────

type EstadoSemaforo = "verde" | "amarillo" | "rojo";

type Paciente = {
  id: string;
  nombre: string;
  apellido: string;
  condicion?: string;
  piso?: string;
  habitacion_id?: string | null;
  estado?: EstadoSemaforo;
  activo: boolean;
};

const MOCK_PACIENTES: Paciente[] = [
  {
    id: "1", nombre: "Carlos", apellido: "Mendoza",
    condicion: "Grave - Monitoreo Continuo",
    piso: "2", habitacion_id: "204-A",
    estado: "rojo", activo: true,
  },
  {
    id: "2", nombre: "María Elena", apellido: "Ortiz",
    condicion: "Estable con observaciones",
    piso: "2", habitacion_id: "208",
    estado: "amarillo", activo: true,
  },
  {
    id: "3", nombre: "Jorge Luis", apellido: "Ríos",
    condicion: "Favorable - Listo para Alta",
    piso: "2", habitacion_id: "211",
    estado: "verde", activo: true,
  },
];

const ACTIVIDAD_RECIENTE = [
  { id: "1", icon: "medkit",  titulo: "Medicamento administrado", sub: "Paciente 204 — 08:00 AM" },
  { id: "2", icon: "pulse",   titulo: "Saturación baja",          sub: "Paciente 112 — hace 10 min" },
  { id: "3", icon: "refresh", titulo: "Preparar enlace de turno", sub: "Área de urgencias" },
];

const SEMAFORO: Record<EstadoSemaforo, { color: string }> = {
  verde:    { color: "#16a34a" },
  amarillo: { color: "#d97706" },
  rojo:     { color: "#dc2626" },
};

const ACCESOS = [
  { label: "Pacientes", icon: "people",       color: "#3b82f6", bg: "#1e3a5f", route: "/(tabs)/pacientes" },
  { label: "Turnos",    icon: "time",          color: "#22c55e", bg: "#14382a", route: "/(tabs)/turnos" },
  { label: "Alertas",   icon: "warning",       color: "#f59e0b", bg: "#3b2f10", route: "/(tabs)/alertas" },
  { label: "Reportes",  icon: "document-text", color: "#ef4444", bg: "#3b1414", route: "/(tabs)/reportes" },
];

// ─── Main dashboard ────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const criticos = MOCK_PACIENTES.filter((p) => p.estado === "rojo").length;

  async function handleSignOut() {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            router.replace("/login");
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>NurseFlow</Text>
        <View style={s.headerIcons}>
          <TouchableOpacity style={s.headerIcon}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerIcon}>
            <Ionicons name="person-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerIcon}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerIcon} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Welcome ───────────────────────────────────────────────── */}
        <Text style={s.welcomeTitle}>Bienvenido, Enfermero</Text>
        <Text style={s.welcomeSub}>Turno Activo: Piso 2 - General</Text>

        {/* ── Resumen del turno ─────────────────────────────────────── */}
        <TouchableOpacity style={s.turnoCard} activeOpacity={0.85}>
          <View style={s.turnoIconBox}>
            <Ionicons name="add" size={28} color="#fff" />
          </View>
          <View>
            <Text style={s.turnoTitle}>Resumen del Turno</Text>
            <Text style={s.turnoSub}>
              {MOCK_PACIENTES.length} pacientes asignados · {criticos} cambio{criticos !== 1 ? "s" : ""} pendiente{criticos !== 1 ? "s" : ""}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── Accesos rápidos ───────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Accesos rápidos</Text>
        <View style={s.grid}>
          {ACCESOS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[s.gridCard, { backgroundColor: a.bg }]}
              activeOpacity={0.8}
              onPress={() => router.push(a.route as any)}
            >
              <View style={[s.gridIconBox, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon as any} size={28} color={a.color} />
              </View>
              <Text style={s.gridLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Pacientes asignados ───────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Pacientes Asignados</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/pacientes" as any)}>
            <Text style={s.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {MOCK_PACIENTES.map((p) => {
          const estado = p.estado ?? "verde";
          const cfg = SEMAFORO[estado];
          return (
            <TouchableOpacity
              key={p.id}
              style={s.patientCard}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/pacientes" as any)}
            >
              <View style={[s.dot, { backgroundColor: cfg.color }]} />
              <View style={s.patientInfo}>
                <Text style={s.patientName}>
                  {p.nombre} {p.apellido}{" "}
                  <Text style={s.patientRoom}>(Cama {p.habitacion_id})</Text>
                </Text>
                <Text style={[s.patientCondicion, { color: cfg.color }]}>
                  {p.condicion}
                </Text>
                <Text style={s.patientSub}>
                  Piso {p.piso} ·{" "}
                  {estado === "rojo"
                    ? "Cuidados Intensivos"
                    : estado === "amarillo"
                    ? "Hab. General (observación)"
                    : "Habitación General"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          );
        })}

        {/* ── Actividad reciente ────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Actividad reciente</Text>

        {ACTIVIDAD_RECIENTE.map((a) => (
          <View key={a.id} style={s.actCard}>
            <View style={s.actIconBox}>
              <Ionicons name={a.icon as any} size={20} color="#f59e0b" />
            </View>
            <View>
              <Text style={s.actTitle}>{a.titulo}</Text>
              <Text style={s.actSub}>{a.sub}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#a8d5e2" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  headerIcons: { flexDirection: "row", gap: 6 },
  headerIcon:  { padding: 6 },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  welcomeTitle: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 4 },
  welcomeSub:   { fontSize: 14, color: "#9ca3af", marginBottom: 20 },

  turnoCard: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
  },
  turnoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  turnoTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  turnoSub:   { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 },
  seeAll:       { fontSize: 13, color: "#60a5fa" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  gridCard: {
    width: "47%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 120,
  },
  gridIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  gridLabel: { fontSize: 15, fontWeight: "600", color: "#f9fafb" },

  patientCard: {
    backgroundColor: "#1e2f45",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  dot:              { width: 13, height: 13, borderRadius: 7 },
  patientInfo:      { flex: 1 },
  patientName:      { fontSize: 15, fontWeight: "700", color: "#f9fafb" },
  patientRoom:      { fontWeight: "400", color: "#9ca3af" },
  patientCondicion: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  patientSub:       { fontSize: 12, color: "#6b7280", marginTop: 2 },

  actCard: {
    backgroundColor: "#1e2f45",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  actIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2d3f55",
    alignItems: "center",
    justifyContent: "center",
  },
  actTitle: { fontSize: 14, fontWeight: "700", color: "#f9fafb" },
  actSub:   { fontSize: 12, color: "#9ca3af", marginTop: 2 },
});