import { StyleSheet, Text, View } from 'react-native';
import { CATEGORIA_COLORES } from '../data/eventos';

interface BadgeProps {
  categoria: string;
}

export default function Badge({ categoria }: BadgeProps) {
  const estilo = CATEGORIA_COLORES[categoria] || { bg: '#f3f4f6', text: '#374151' };

  return (
    <View style={[styles.badge, { backgroundColor: estilo.bg }]}> 
      <Text style={[styles.texto, { color: estilo.text }]}>{categoria.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  texto: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
});
