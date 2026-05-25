import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ─────────────────────────────────────────────────────────────────────

type StockStatus = "ok" | "low" | "out";

interface Medicamento {
  id: string;
  nombre: string;
  dosis: string;
  categoria: string;
  stock: number;
  unidad: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_MEDICAMENTOS: Medicamento[] = [
  { id: "1", nombre: "Paracetamol", dosis: "500mg", categoria: "Analgésico", stock: 150, unidad: "tabs" },
  { id: "2", nombre: "Ketorolaco", dosis: "30mg", categoria: "AINE", stock: 0, unidad: "amp" },
  { id: "3", nombre: "Omeprazol", dosis: "40mg", categoria: "Protector Gástrico", stock: 45, unidad: "caps" },
  { id: "4", nombre: "Propofol", dosis: "1%", categoria: "Anestésico", stock: 2, unidad: "fco" },
  { id: "5", nombre: "Amoxicilina", dosis: "500mg", categoria: "Antibiótico", stock: 88, unidad: "caps" },
  { id: "6", nombre: "Metoprolol", dosis: "50mg", categoria: "Cardiovascular", stock: 0, unidad: "tabs" },
  { id: "7", nombre: "Ibuprofeno", dosis: "400mg", categoria: "AINE", stock: 7, unidad: "tabs" },
  { id: "8", nombre: "Tramadol", dosis: "50mg", categoria: "Analgésico", stock: 34, unidad: "caps" },
  { id: "9", nombre: "Midazolam", dosis: "15mg", categoria: "Anestésico", stock: 12, unidad: "amp" },
  { id: "10", nombre: "Metronidazol", dosis: "500mg", categoria: "Antibiótico", stock: 60, unidad: "tabs" },
];

const CATEGORIAS = [
  "Todos",
  "Analgésico",
  "AINE",
  "Anestésico",
  "Antibiótico",
  "Cardiovascular",
  "Protector Gástrico",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getStatus(stock: number): StockStatus {
  if (stock === 0) return "out";
  if (stock <= 10) return "low";
  return "ok";
}

const STATUS_CONFIG = {
  ok:  { label: "Disponible", bg: "#dcfce7", color: "#166534", dot: "#16a34a" },
  low: { label: "Stock bajo", bg: "#fef9c3", color: "#854d0e", dot: "#d97706" },
  out: { label: "Agotado",    bg: "#fee2e2", color: "#991b1b", dot: "#dc2626" },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function MedCard({ med }: { med: Medicamento }) {
  const status = getStatus(med.stock);
  const cfg = STATUS_CONFIG[status];

  return (
    <View style={styles.card}>
      {/* Icon box */}
      <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
        <View style={[styles.iconDot, { backgroundColor: cfg.dot }]} />
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {med.nombre}{" "}
          <Text style={styles.cardDosis}>{med.dosis}</Text>
        </Text>
        <Text style={styles.cardSub}>
          {med.categoria} · Stock: {med.stock} {med.unidad}
        </Text>
      </View>

      {/* Badge */}
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function FarmaciaScreen() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState<"all" | "low">("all");
  const [catOpen, setCatOpen] = useState(false);

  const filtered = MOCK_MEDICAMENTOS.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.nombre.toLowerCase().includes(q) ||
      m.categoria.toLowerCase().includes(q) ||
      m.dosis.toLowerCase().includes(q);
    const matchCat = categoria === "Todos" || m.categoria === categoria;
    const status = getStatus(m.stock);
    const matchStatus =
      filterStatus === "all" || status === "low" || status === "out";
    return matchSearch && matchCat && matchStatus;
  });

  const totalOk  = MOCK_MEDICAMENTOS.filter((m) => getStatus(m.stock) === "ok").length;
  const totalLow = MOCK_MEDICAMENTOS.filter((m) => getStatus(m.stock) === "low").length;
  const totalOut = MOCK_MEDICAMENTOS.filter((m) => getStatus(m.stock) === "out").length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* Stats row */}
            <View style={styles.statsRow}>
              <StatCard label="En stock"   value={totalOk}  color="#2b7bb9" />
              <StatCard label="Stock bajo" value={totalLow} color="#d97706" />
              <StatCard label="Agotado"    value={totalOut} color="#dc2626" />
            </View>

            {/* Controls card */}
            <View style={styles.controlsCard}>
              {/* Search */}
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar medicamento..."
                  placeholderTextColor="#9ca3af"
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Category picker (inline scroll) */}
              <View style={styles.catRow}>
                {CATEGORIAS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategoria(c)}
                    style={[
                      styles.catChip,
                      categoria === c && styles.catChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        categoria === c && styles.catChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status filter */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  onPress={() => setFilterStatus("all")}
                  style={[styles.filterBtn, filterStatus === "all" && styles.filterBtnActive]}
                >
                  <Text style={[styles.filterBtnText, filterStatus === "all" && styles.filterBtnTextActive]}>
                    Todos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFilterStatus("low")}
                  style={[styles.filterBtn, filterStatus === "low" && styles.filterBtnActive]}
                >
                  <Text style={[styles.filterBtnText, filterStatus === "low" && styles.filterBtnTextActive]}>
                    Stock bajo / Agotado
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Sin resultados para tu búsqueda.</Text>
          </View>
        }
        renderItem={({ item }) => <MedCard med={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => alert("Formulario para agregar medicamento — próximamente")}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>+ Agregar medicamento</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#a8d5e2",
  },
  scroll: {
    padding: 16,
    gap: 12,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },

  // Controls
  controlsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 9,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  catRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  catChipActive: {
    backgroundColor: "#1a3a5c",
    borderColor: "#1a3a5c",
  },
  catChipText: {
    fontSize: 12,
    color: "#374151",
  },
  catChipTextActive: {
    color: "#fff",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterBtnActive: {
    backgroundColor: "#1a3a5c",
    borderColor: "#1a3a5c",
  },
  filterBtnText: {
    fontSize: 12,
    color: "#374151",
  },
  filterBtnTextActive: {
    color: "#fff",
  },

  // Med card
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  cardDosis: {
    fontWeight: "400",
    color: "#6b7280",
  },
  cardSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
  },

  // Empty
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },

  // Add button
  addBtn: {
    backgroundColor: "#1a3a5c",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});