import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface PrecioTagProps {
  precio: string;
}

export default function PrecioTag({ precio }: PrecioTagProps) {
  const libre = precio === 'Gratuito';
  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: libre ? colors.verdePale : colors.azulPale,
          borderColor: libre ? colors.verdeBorder : colors.azulBorder,
        },
      ]}
    >
      <Text style={[styles.texto, { color: libre ? colors.verdeOscuro : colors.brandDark }]}>
        {precio}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  texto: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
