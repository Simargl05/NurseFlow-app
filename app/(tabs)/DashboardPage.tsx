import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Section = 'panel' | 'pacientes' | 'reportes' | 'farmacia';

const SECTION_LABELS: Record<Section, string> = {
  panel: 'Panel',
  pacientes: 'Pacientes',
  reportes: 'Reportes de enfermería',
  farmacia: 'Directorio de Farmacia',
};

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>('panel');

  // Datos de prueba (mock)
  const stats = { medicos: 2, enfermeros: 5, pacientes: 3 };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>NurseFlow, cuidado continuo</Text>

      {/* Navegación simple */}
      <View style={styles.nav}>
        {(['panel', 'pacientes', 'reportes', 'farmacia'] as Section[]).map(section => (
          <TouchableOpacity key={section} onPress={() => setActiveSection(section)} style={styles.navButton}>
            <Text style={[
              styles.navText,
              activeSection === section && styles.navTextActive
            ]}>
              {SECTION_LABELS[section]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeSection === 'panel' && (
          <View style={styles.statsGrid}>
            <StatCard label="Médicos disponibles" value={stats.medicos} />
            <StatCard label="Enfermeros disponibles" value={stats.enfermeros} />
            <StatCard label="Pacientes en piso" value={stats.pacientes} />
          </View>
        )}

        {activeSection === 'pacientes' && <Text style={styles.sectionText}>Aquí iría la lista de pacientes</Text>}
        {activeSection === 'reportes' && <Text style={styles.sectionText}>Aquí irían los reportes de enfermería</Text>}
        {activeSection === 'farmacia' && <Text style={styles.sectionText}>Aquí iría el directorio de farmacia</Text>}
      </ScrollView>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity onPress={() => {}} style={styles.logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a8d5e2', paddingTop: 40 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 20 },
  nav: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  navButton: { padding: 10 },
  navText: { fontSize: 14, color: '#555' },
  navTextActive: { color: '#1a3a5c', fontWeight: 'bold' },
  content: { paddingHorizontal: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, margin: 8, width: '40%', alignItems: 'center' },
  cardLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#2b7bb9' },
  sectionText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: '#333' },
  logout: { padding: 16, alignItems: 'center' },
  logoutText: { color: 'red', fontWeight: 'bold' },
});