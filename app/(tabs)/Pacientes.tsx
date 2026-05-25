import { useState } from "react";
import {
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// ─── Types ─────────────────────────────────────────────────────────────────────

type EstadoSemaforo = "verde" | "amarillo" | "rojo";

type Paciente = {
  id: string;
  nombre: string;
  apellido: string;
  sexo?: string;
  fecha_ingreso?: string | null;
  condicion?: string;
  piso?: string;
  habitacion_id?: string | null;
  medico_id?: string | null;
  enfermero_id?: string | null;
  estado?: EstadoSemaforo;
  activo: boolean;
};

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_PROFILES: Record<string, string> = {
  "m1": "Dr. Roberto Salinas",
  "m2": "Dra. Lucía Herrera",
  "e1": "Enf. Carla Vega",
  "e2": "Enf. Marco Torres",
};

const MOCK_PACIENTES: Paciente[] = [
  {
    id: "1", nombre: "Ana", apellido: "Martínez", sexo: "Femenino",
    fecha_ingreso: "2025-05-01", condicion: "Neumonía bilateral",
    piso: "2", habitacion_id: "201", medico_id: "m1", enfermero_id: "e1",
    estado: "rojo", activo: true,
  },
  {
    id: "2", nombre: "Carlos", apellido: "López", sexo: "Masculino",
    fecha_ingreso: "2025-05-10", condicion: "Fractura de fémur",
    piso: "3", habitacion_id: "305", medico_id: "m2", enfermero_id: "e2",
    estado: "amarillo", activo: true,
  },
  {
    id: "3", nombre: "María", apellido: "García", sexo: "Femenino",
    fecha_ingreso: "2025-05-15", condicion: "Post-operatorio apendicectomía",
    piso: "1", habitacion_id: "102", medico_id: "m1", enfermero_id: "e1",
    estado: "verde", activo: true,
  },
  {
    id: "4", nombre: "Jorge", apellido: "Ramírez", sexo: "Masculino",
    fecha_ingreso: "2025-05-18", condicion: undefined,
    piso: "2", habitacion_id: null, medico_id: null, enfermero_id: "e2",
    estado: "verde", activo: true,
  },
];

// ─── Config ────────────────────────────────────────────────────────────────────

const SEMAFORO_CONFIG: Record<EstadoSemaforo, { label: string; color: string; bg: string; ring: string }> = {
  verde:    { label: "Estable",    color: "#16a34a", bg: "#dcfce7", ring: "#86efac" },
  amarillo: { label: "Precaución", color: "#d97706", bg: "#fef3c7", ring: "#fcd34d" },
  rojo:     { label: "Crítico",    color: "#dc2626", bg: "#fee2e2", ring: "#fca5a5" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ─── Traffic light ─────────────────────────────────────────────────────────────

function TrafficLight({ estado }: { estado: EstadoSemaforo }) {
  const order: EstadoSemaforo[] = ["rojo", "amarillo", "verde"];
  return (
    <View style={tl.column}>
      {order.map((color) => {
        const active = estado === color;
        const cfg = SEMAFORO_CONFIG[color];
        return (
          <View key={color} style={tl.dot}>
            <View
              style={[
                tl.circle,
                { backgroundColor: active ? cfg.color : "#d1d5db" },
                active && { shadowColor: cfg.color, shadowOpacity: 0.7, shadowRadius: 6, elevation: 4 },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const tl = StyleSheet.create({
  column: { flexDirection: "column", alignItems: "center", gap: 5, paddingVertical: 4 },
  dot:    { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  circle: { width: 14, height: 14, borderRadius: 7 },
});

// ─── Patient card ──────────────────────────────────────────────────────────────

function PatientCard({ paciente, onPress }: { paciente: Paciente; onPress: () => void }) {
  const estado = paciente.estado ?? "verde";
  const cfg = SEMAFORO_CONFIG[estado];
  const medico = paciente.medico_id ? MOCK_PROFILES[paciente.medico_id] : null;
  const enfermero = paciente.enfermero_id ? MOCK_PROFILES[paciente.enfermero_id] : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <TrafficLight estado={estado} />

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>
            {paciente.nombre} {paciente.apellido}
          </Text>
          <View style={[styles.stateBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.stateBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.cardCondicion} numberOfLines={1}>
          {paciente.condicion ?? "Sin diagnóstico registrado"}
        </Text>

        <View style={styles.metaRow}>
          {paciente.piso && <MetaChip icon="🏢" text={`Piso ${paciente.piso}`} />}
          <MetaChip icon="🛏" text={`Hab. ${paciente.habitacion_id ?? "—"}`} />
          <MetaChip icon="🩺" text={medico ?? "Sin médico"} />
          <MetaChip icon="👤" text={enfermero ?? "Sin enfermero"} />
          <MetaChip icon="📅" text={`Ingreso: ${formatDate(paciente.fecha_ingreso)}`} />
        </View>
      </View>

      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

function MetaChip({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text style={styles.metaText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

// ─── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({
  paciente,
  onClose,
}: {
  paciente: Paciente;
  onClose: () => void;
}) {
  const estado = paciente.estado ?? "verde";
  const cfg = SEMAFORO_CONFIG[estado];
  const medico = paciente.medico_id ? MOCK_PROFILES[paciente.medico_id] ?? "—" : "—";
  const enfermero = paciente.enfermero_id ? MOCK_PROFILES[paciente.enfermero_id] ?? "—" : "—";

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={modal.sheet}>
          {/* Header */}
          <View style={[modal.header, { backgroundColor: cfg.bg, borderBottomColor: cfg.ring }]}>
            <View style={{ flex: 1 }}>
              <Text style={modal.headerName}>
                {paciente.nombre} {paciente.apellido}
              </Text>
              <View style={[modal.headerBadge, { backgroundColor: cfg.color }]}>
                <Text style={modal.headerBadgeText}>{cfg.label}</Text>
              </View>
            </View>
            <TrafficLight estado={estado} />
          </View>

          {/* Detail rows */}
          <ScrollView style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <DetailRow icon="🧪" label="Condición / Patología" value={paciente.condicion ?? "Sin diagnóstico"} />
            <DetailRow icon="📅" label="Fecha de ingreso"      value={formatDate(paciente.fecha_ingreso)} />
            <DetailRow icon="🏢" label="Piso"                  value={paciente.piso ?? "—"} />
            <DetailRow icon="🛏" label="Habitación"            value={paciente.habitacion_id ?? "—"} />
            <DetailRow icon="🩺" label="Médico asignado"       value={medico} />
            <DetailRow icon="👤" label="Enfermero/a asignado/a" value={enfermero} />
            {paciente.sexo && (
              <DetailRow icon="⚥" label="Sexo" value={paciente.sexo} />
            )}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Close button */}
          <View style={{ padding: 20 }}>
            <TouchableOpacity style={modal.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={modal.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={dr.row}>
      <Text style={dr.icon}>{icon}</Text>
      <View>
        <Text style={dr.label}>{label}</Text>
        <Text style={dr.value}>{value}</Text>
      </View>
    </View>
  );
}

const dr = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  icon:  { fontSize: 16, marginTop: 2 },
  label: { fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  value: { fontSize: 14, fontWeight: "500", color: "#1f2937" },
});

const modal = StyleSheet.create({
  overlay:        { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet:          { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden", maxHeight: "85%" },
  header:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 2 },
  headerName:     { fontSize: 17, fontWeight: "700", color: "#1f2937", marginBottom: 4 },
  headerBadge:    { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  headerBadgeText:{ fontSize: 11, fontWeight: "600", color: "#fff" },
  closeBtn:       { backgroundColor: "#1a3a5c", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  closeBtnText:   { color: "#fff", fontSize: 15, fontWeight: "600" },
});

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function PacientesScreen() {
  const [seleccionado, setSeleccionado] = useState<Paciente | null>(null);

  const totalVerde    = MOCK_PACIENTES.filter((p) => (p.estado ?? "verde") === "verde").length;
  const totalAmarillo = MOCK_PACIENTES.filter((p) => p.estado === "amarillo").length;
  const totalRojo     = MOCK_PACIENTES.filter((p) => p.estado === "rojo").length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={MOCK_PACIENTES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <>
            {/* Legend + actions */}
            <View style={styles.topBar}>
              <View style={styles.legend}>
                {(["verde", "amarillo", "rojo"] as EstadoSemaforo[]).map((e) => (
                  <View key={e} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: SEMAFORO_CONFIG[e].color }]} />
                    <Text style={styles.legendText}>{SEMAFORO_CONFIG[e].label}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => alert("Agregar paciente — próximamente")}
              >
                <Text style={styles.addBtnText}>+ Agregar</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatPill label="Estables"   value={totalVerde}    color="#16a34a" bg="#dcfce7" />
              <StatPill label="Precaución" value={totalAmarillo} color="#d97706" bg="#fef3c7" />
              <StatPill label="Críticos"   value={totalRojo}     color="#dc2626" bg="#fee2e2" />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <PatientCard paciente={item} onPress={() => setSeleccionado(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {seleccionado && (
        <DetailModal paciente={seleccionado} onClose={() => setSeleccionado(null)} />
      )}
    </SafeAreaView>
  );
}

function StatPill({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <View style={[styles.statPill, { backgroundColor: bg }]}>
      <Text style={[styles.statPillValue, { color }]}>{value}</Text>
      <Text style={[styles.statPillLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#a8d5e2" },
  scroll:   { padding: 16, gap: 10 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 2,
  },
  legend:     { flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:  { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#4b5563" },
  addBtn:     { backgroundColor: "#1a3a5c", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  statsRow:       { flexDirection: "row", gap: 8, marginBottom: 4 },
  statPill:       { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  statPillValue:  { fontSize: 20, fontWeight: "700" },
  statPillLabel:  { fontSize: 10, fontWeight: "500", marginTop: 1 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody:       { flex: 1 },
  cardHeader:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardName:       { fontSize: 15, fontWeight: "700", color: "#1f2937", flex: 1 },
  stateBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  stateBadgeText: { fontSize: 11, fontWeight: "600" },
  cardCondicion:  { fontSize: 12, color: "#6b7280", fontStyle: "italic", marginTop: 2 },
  metaRow:        { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  metaChip:       { flexDirection: "row", alignItems: "center", gap: 3 },
  metaIcon:       { fontSize: 11 },
  metaText:       { fontSize: 11, color: "#6b7280" },
  cardArrow:      { fontSize: 20, color: "#d1d5db" },
});