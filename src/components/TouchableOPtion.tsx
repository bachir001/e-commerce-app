import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';

interface TouchableOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const TouchableOption: React.FC<TouchableOptionProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView
        style={[
          styles.container,
          selected && styles.selectedContainer,
        ]}
      >
        <ThemedText 
          style={[
            styles.text,
            selected && styles.selectedText
          ]}
        >
          {label}
        </ThemedText>
        {selected && (
          <ThemedText style={styles.checkmark}>✓</ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedContainer: {
    borderColor: '#007AFF', // Use your theme's accent color here
    backgroundColor: 'rgba(0, 122, 255, 0.1)', // Subtle selection background
  },
  text: {
    fontSize: 16,
  },
  selectedText: {
    color: '#007AFF', // Use your theme's accent color
    fontWeight: '600',
  },
  checkmark: {
    color: '#007AFF', // Use your theme's accent color
    fontSize: 16,
    marginLeft: 10,
  },
});

export default TouchableOption;