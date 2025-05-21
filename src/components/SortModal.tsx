import React from 'react';
import { View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import TouchableOption from '@/components/TouchableOPtion';

type SortOption = 'default'|'newest'|'a-z'|'z-a'|'price-asc'|'price-desc';

interface SortModalProps {
  visible: boolean;
  selectedOption: SortOption;
  onClose: () => void;
  onSelect: (option: SortOption) => void;
}

const SortModal: React.FC<SortModalProps> = ({
  visible,
  selectedOption,
  onClose,
  onSelect,
}) => {
  const options = [
    { label: 'Default', value: 'default' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Name (A-Z)', value: 'a-z' },
    { label: 'Name (Z-A)', value: 'z-a' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ];

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      style={{ margin: 0, justifyContent: 'flex-end' }}
      onBackdropPress={onClose}
    >
      <ThemedView style={styles.modal}>
        <ThemedText style={styles.title}>Sort By</ThemedText>
        
        {options.map(option => (
          <TouchableOption
            key={option.value}
            label={option.label}
            selected={option.value === selectedOption}
            onPress={() => onSelect(option.value as SortOption)}
          />
        ))}
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SortModal;