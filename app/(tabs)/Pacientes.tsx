import {
  addDoc,
  collection, getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  FlatList,
  Modal, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

type EstadoSemaforo = 'verde' | 'amarillo' | 'rojo';

type EstadoSemaforo = 'verde' | 'amarillo' | 'rojo';

export type Paciente = {
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

type Profile = {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
};

type NuevoPaciente = {
  nombre: string;
  apellido: string;
  condicion: string;
  piso: string;
  habitacion_id: string;
  fecha_ingreso: string;
  estado: EstadoSemaforo;
  sexo: string;
  medico_id: string;
  enfermero_id: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SEMAFORO_CONFIG: Record<
  EstadoSemaforo,
  { label: string; color: string; bg: string }
> = {
  verde:    { label: 'Estable',    color: '#16a34a', bg: '#dcfce7' },
  amarillo: { label: 'Precaución', color: '#d97706', bg: '#fef3c7' },
  rojo:     { label: 'Crítico',    color: '#dc2626', bg: '#fee2e2' },
};

const ESTADO_OPTIONS: EstadoSemaforo[] = ['verde', 'amarillo', 'rojo'];
const SEXO_OPTIONS = ['Masculino', 'Femenino', 'Otro'];

const NUEVO_PACIENTE_INITIAL: NuevoPaciente = {
  nombre: '', apellido: '', condicion: '', piso: '',
  habitacion_id: '', fecha_ingreso: '', estado: 'verde',
  sexo: '', medico_id: '', enfermero_id: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrafficLight({ estado }: { estado: EstadoSemaforo }) {
  return (
    <View style={styles.trafficContainer}>
      {(['rojo', 'amarillo', 'verde'] as EstadoSemaforo[]).map(color => (
        <View key={color} style={styles.lightWrapper}>
          <View
            style={[
              styles.light,
              {
                backgroundColor:
                  estado === color
                    ? SEMAFORO_CONFIG[color].color
                    : '#d1d5db',
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function StatBadge({
  count, label, estado,
}: { count: number; label: string; estado: EstadoSemaforo }) {
  const cfg = SEMAFORO_CONFIG[estado];
  return (
    <View style={[styles.statBox, { borderLeftColor: cfg.color }]}>
      <Text style={styles.statNum}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPacientesPage() {
  const [pacientes, setPacientes]     = useState<Paciente[]>([]);
  const [profileMap, setProfileMap]   = useState<Record<string, string>>({});
  const [profiles, setProfiles]       = useState<Profile[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [seleccionado, setSeleccionado] = useState<Paciente | null>(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [nuevo, setNuevo]             = useState<NuevoPaciente>(NUEVO_PACIENTE_INITIAL);

  useEffect(() => { fetchData(); }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────

  async function fetchData() {
    setLoading(true);
    try {
      // Admin: fetch ALL active patients (no enfermero_id filter)
      const pacientesSnap = await getDocs(
        query(collection(db, 'Pacientes'), where('activo', '==', true))
      );
      const allPacientes = pacientesSnap.docs.map(
        d => ({ id: d.id, ...d.data() } as Paciente)
      );

      const profSnap = await getDocs(collection(db, 'profiles'));
      const pMap: Record<string, string> = {};
      const profList: Profile[] = [];
      profSnap.docs.forEach(d => {
        const p = d.data() as Profile;
        pMap[d.id] = `${p.nombre} ${p.apellido}`;
        profList.push({ id: d.id, ...p });
      });

      setPacientes(allPacientes);
      setProfileMap(pMap);
      setProfiles(profList);
    } catch (err) {
      console.error('Error cargando pacientes:', err);
      Alert.alert('Error', 'No se pudieron cargar los pacientes.');
    }
    setLoading(false);
  }

  // ── Add patient ────────────────────────────────────────────────────────────

  async function handleAddPaciente() {
    if (!nuevo.nombre.trim() || !nuevo.apellido.trim()) {
      Alert.alert('Campos requeridos', 'Nombre y apellido son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'Pacientes'), {
        nombre:        nuevo.nombre.trim(),
        apellido:      nuevo.apellido.trim(),
        condicion:     nuevo.condicion.trim() || null,
        piso:          nuevo.piso.trim() || null,
        habitacion_id: nuevo.habitacion_id.trim() || null,
        fecha_ingreso: nuevo.fecha_ingreso || null,
        estado:        nuevo.estado,
        sexo:          nuevo.sexo || null,
        medico_id:     nuevo.medico_id || null,
        enfermero_id:  nuevo.enfermero_id || null,
        activo:        true,
        created_at:    serverTimestamp(),
      });
      setShowAdd(false);
      setNuevo(NUEVO_PACIENTE_INITIAL);
      await fetchData();
    } catch (err) {
      console.error('Error guardando paciente:', err);
      Alert.alert('Error', 'No se pudo guardar el paciente.');
    }
    setSaving(false);
  }

  // ── Derived counts ─────────────────────────────────────────────────────────

  const counts = {
    verde:    pacientes.filter(p => (p.estado ?? 'verde') === 'verde').length,
    amarillo: pacientes.filter(p => p.estado === 'amarillo').length,
    rojo:     pacientes.filter(p => p.estado === 'rojo').length,
  };

  const medicos    = profiles.filter(p => p.rol === 'medico');
  const enfermeros = profiles.filter(p => p.rol === 'enfermero');

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
        <Text style={styles.loadingText}>Cargando pacientes…</Text>
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBadge count={counts.verde}    label="Estables"   estado="verde"    />
        <StatBadge count={counts.amarillo} label="Precaución" estado="amarillo" />
        <StatBadge count={counts.rojo}     label="Críticos"   estado="rojo"     />
      </View>

      {/* Add button */}
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
        <Text style={styles.addBtnText}>+ Agregar paciente</Text>
      </TouchableOpacity>

      {/* Patient list */}
      {pacientes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No hay pacientes registrados aún.</Text>
        </View>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const estado = item.estado ?? 'verde';
            const cfg    = SEMAFORO_CONFIG[estado];
            const medico    = item.medico_id    ? profileMap[item.medico_id]    : null;
            const enfermero = item.enfermero_id ? profileMap[item.enfermero_id] : null;

            return (
              <TouchableOpacity
                style={[styles.card, { borderLeftColor: cfg.color }]}
                onPress={() => setSeleccionado(item)}
                activeOpacity={0.85}
              >
                <TrafficLight estado={estado} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.nombre} {item.apellido}
                    </Text>
                    <Text style={[styles.badge, { backgroundColor: cfg.bg, color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>
                  <Text style={styles.condicion} numberOfLines={1}>
                    {item.condicion || 'Sin diagnóstico registrado'}
                  </Text>
                  <View style={styles.chipsRow}>
                    <Text style={styles.chip}>Piso {item.piso ?? '—'}</Text>
                    <Text style={styles.chip}>Hab. {item.habitacion_id ?? '—'}</Text>
                    {medico    && <Text style={styles.chip}>{medico}</Text>}
                    {enfermero && <Text style={styles.chip}>{enfermero}</Text>}
                    <Text style={styles.chip}>Ingreso: {formatDate(item.fecha_ingreso)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <Modal visible={!!seleccionado} transparent animationType="slide">
        {seleccionado && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHandle} />
              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* Header */}
                <View style={styles.modalHeaderBar}>
                  <Text style={styles.modalName}>
                    {seleccionado.nombre} {seleccionado.apellido}
                  </Text>
                  <Text style={[
                    styles.modalStatus,
                    { color: SEMAFORO_CONFIG[seleccionado.estado ?? 'verde'].color },
                  ]}>
                    ● {SEMAFORO_CONFIG[seleccionado.estado ?? 'verde'].label}
                  </Text>
                </View>

                {/* Rows */}
                {[
                  ['Condición',      seleccionado.condicion ?? '—'],
                  ['Fecha ingreso',  formatDate(seleccionado.fecha_ingreso)],
                  ['Piso',           seleccionado.piso ?? '—'],
                  ['Habitación',     seleccionado.habitacion_id ?? '—'],
                  ['Médico',         seleccionado.medico_id ? profileMap[seleccionado.medico_id] ?? '—' : '—'],
                  ['Enfermero',      seleccionado.enfermero_id ? profileMap[seleccionado.enfermero_id] ?? '—' : '—'],
                  ['Sexo',           seleccionado.sexo ?? '—'],
                ].map(([key, val]) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailKey}>{key}</Text>
                    <Text style={styles.detailVal}>{val}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSeleccionado(null)}>
                <Text style={styles.closeBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* ── Add Patient Modal ────────────────────────────────────────────── */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeaderBar}>
                <Text style={styles.modalName}>Agregar paciente</Text>
                <Text style={styles.modalSubtitle}>Nuevo registro en piso</Text>
              </View>

              {/* Name row */}
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    value={nuevo.nombre}
                    onChangeText={t => setNuevo(p => ({ ...p, nombre: t }))}
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Apellido *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Apellido"
                    value={nuevo.apellido}
                    onChangeText={t => setNuevo(p => ({ ...p, apellido: t }))}
                  />
                </View>
              </View>

              {/* Condicion */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Condición / Diagnóstico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Neumonía leve"
                  value={nuevo.condicion}
                  onChangeText={t => setNuevo(p => ({ ...p, condicion: t }))}
                />
              </View>

              {/* Piso / Habitacion */}
              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Piso</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 3"
                    keyboardType="numeric"
                    value={nuevo.piso}
                    onChangeText={t => setNuevo(p => ({ ...p, piso: t }))}
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.formLabel}>Habitación</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 302"
                    value={nuevo.habitacion_id}
                    onChangeText={t => setNuevo(p => ({ ...p, habitacion_id: t }))}
                  />
                </View>
              </View>

              {/* Fecha ingreso */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Fecha de ingreso (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2024-06-15"
                  value={nuevo.fecha_ingreso}
                  onChangeText={t => setNuevo(p => ({ ...p, fecha_ingreso: t }))}
                />
              </View>

              {/* Estado selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Estado</Text>
                <View style={styles.selectorRow}>
                  {ESTADO_OPTIONS.map(est => {
                    const cfg = SEMAFORO_CONFIG[est];
                    const active = nuevo.estado === est;
                    return (
                      <TouchableOpacity
                        key={est}
                        style={[
                          styles.selectorChip,
                          { borderColor: cfg.color },
                          active && { backgroundColor: cfg.bg },
                        ]}
                        onPress={() => setNuevo(p => ({ ...p, estado: est }))}
                      >
                        <Text style={[styles.selectorText, { color: cfg.color }]}>
                          {cfg.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Sexo selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sexo</Text>
                <View style={styles.selectorRow}>
                  {SEXO_OPTIONS.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.selectorChip,
                        { borderColor: '#cbd5e1' },
                        nuevo.sexo === s && { backgroundColor: '#e0f2fe', borderColor: '#3b82f6' },
                      ]}
                      onPress={() => setNuevo(p => ({ ...p, sexo: s }))}
                    >
                      <Text style={[
                        styles.selectorText,
                        { color: nuevo.sexo === s ? '#3b82f6' : '#64748b' },
                      ]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Medico picker */}
              {medicos.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Médico asignado</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.selectorRow}>
                      {medicos.map(m => (
                        <TouchableOpacity
                          key={m.id}
                          style={[
                            styles.selectorChip,
                            { borderColor: '#cbd5e1' },
                            nuevo.medico_id === m.id && { backgroundColor: '#e0f2fe', borderColor: '#3b82f6' },
                          ]}
                          onPress={() => setNuevo(p => ({ ...p, medico_id: p.medico_id === m.id ? '' : m.id }))}
                        >
                          <Text style={[
                            styles.selectorText,
                            { color: nuevo.medico_id === m.id ? '#3b82f6' : '#64748b' },
                          ]}>
                            {m.nombre} {m.apellido}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Enfermero picker */}
              {enfermeros.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Enfermero asignado</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.selectorRow}>
                      {enfermeros.map(e => (
                        <TouchableOpacity
                          key={e.id}
                          style={[
                            styles.selectorChip,
                            { borderColor: '#cbd5e1' },
                            nuevo.enfermero_id === e.id && { backgroundColor: '#e0f2fe', borderColor: '#3b82f6' },
                          ]}
                          onPress={() => setNuevo(p => ({ ...p, enfermero_id: p.enfermero_id === e.id ? '' : e.id }))}
                        >
                          <Text style={[
                            styles.selectorText,
                            { color: nuevo.enfermero_id === e.id ? '#3b82f6' : '#64748b' },
                          ]}>
                            {e.nombre} {e.apellido}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Actions */}
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleAddPaciente}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Guardar paciente</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowAdd(false); setNuevo(NUEVO_PACIENTE_INITIAL); }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f1f5f9' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748b' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8, padding: 12 },
  statBox:  {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10,
    alignItems: 'center', borderLeftWidth: 3,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  statNum:   { fontFamily: 'monospace', fontSize: 18, fontWeight: '700', color: '#1e293b' },
  statLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },

  // Add button
  addBtn: {
    marginHorizontal: 12, marginBottom: 4, backgroundColor: '#1e3a5f',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // List
  listContent: { padding: 12, paddingTop: 8 },
  emptyBox:   { margin: 24, padding: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' },
  emptyText:  { color: '#64748b' },

  // Card
  card: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 12,
    borderRadius: 12, marginBottom: 10, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6,
    borderLeftWidth: 4,
  },
  cardContent: { flex: 1, marginLeft: 8 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:   { fontSize: 15, fontWeight: '700', color: '#1e293b', flex: 1, marginRight: 6 },
  badge: {
    fontSize: 10, fontWeight: '600', paddingVertical: 2, paddingHorizontal: 8,
    borderRadius: 20,
  },
  condicion: { fontSize: 12, color: '#475569', marginTop: 3 },
  chipsRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chip: {
    backgroundColor: '#f1f5f9', borderRadius: 6,
    paddingVertical: 2, paddingHorizontal: 7, fontSize: 10, color: '#64748b',
  },

  // Traffic light
  trafficContainer: { flexDirection: 'column', gap: 4, justifyContent: 'center', alignItems: 'center', width: 14 },
  lightWrapper:     {},
  light:            { width: 10, height: 10, borderRadius: 5 },

  // Modal shared
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', paddingBottom: 24,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#e2e8f0',
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalScroll:     { paddingBottom: 8 },
  modalHeaderBar:  { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalName:       { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  modalStatus:     { fontSize: 13, fontWeight: '600', marginTop: 4 },
  modalSubtitle:   { fontSize: 12, color: '#64748b', marginTop: 3 },

  // Detail rows
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, marginHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  detailKey: { fontSize: 12, color: '#64748b' },
  detailVal: { fontSize: 12, fontWeight: '600', color: '#1e293b', textAlign: 'right', flex: 1, marginLeft: 12 },

  // Close / cancel
  closeBtn: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: '#1e3a5f',
    borderRadius: 12, padding: 13, alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Add form
  formGroup:     { paddingHorizontal: 20, marginTop: 12 },
  formRow:       { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 12 },
  formGroupHalf: { flex: 1 },
  formLabel:     { fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 10,
    padding: 10, fontSize: 14, color: '#1e293b', backgroundColor: '#fff',
  },
  selectorRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  selectorChip: {
    borderWidth: 1.5, borderRadius: 20, paddingVertical: 5,
    paddingHorizontal: 12,
  },
  selectorText: { fontSize: 12, fontWeight: '600' },
  saveBtn: {
    marginHorizontal: 20, marginTop: 20, backgroundColor: '#3b82f6',
    borderRadius: 12, padding: 13, alignItems: 'center',
  },
  saveBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelBtn: {
    marginHorizontal: 20, marginTop: 8, backgroundColor: '#f1f5f9',
    borderRadius: 12, padding: 13, alignItems: 'center',
  },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 14 },
});
