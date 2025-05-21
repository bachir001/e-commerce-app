// FilterModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import Checkbox from 'expo-checkbox';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/common/ThemedText';
import {  AvailableFilters, SelectedFilters } from '@/types/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterModalProps {
  visible: boolean;
  options: AvailableFilters;
  selected: SelectedFilters;
  onClose: () => void;
  onApply: (selection: Partial<SelectedFilters>) => void;
  onReset: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  options,
  selected,
  onClose,
  onApply,
  onReset,
}) => {
  const [localSelected, setLocalSelected] = useState<Record<string, number[]>>(selected.selectedByKey);
  const [priceRange, setPriceRange] = useState<[number, number]>(selected.priceRange);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (visible) {
      setLocalSelected(selected.selectedByKey);
      setPriceRange(selected.priceRange);
      const sections: Record<string, boolean> = {};
      Object.keys(options.filters).forEach(key => (sections[key] = false));
      if (options.bounds) sections['price'] = false;
      setExpandedSections(sections);
    }
  }, [visible, selected, options]);

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleItem = useCallback((key: string, id: number) => {
    setLocalSelected(prev => {
      const current = prev[key] || [];
      const updated = current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id];
      return { ...prev, [key]: updated };
    });
  }, []);

  const handleApply = () => {
    onApply({ selectedByKey: localSelected, priceRange });
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInLeft"
      animationOut="slideOutLeft"
      style={styles.modalWrapper}
      onBackdropPress={onClose}
    >
      <View style={styles.drawer}>
        <ThemedText style={styles.title}>Filter Products</ThemedText>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {Object.entries(options.filters).map(([key, items]) => (
            <View key={key} style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(key)}
              >
                <ThemedText style={styles.sectionTitle}>{capitalize(key)}</ThemedText>
                <Ionicons
                  name={expandedSections[key] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                />
              </TouchableOpacity>
              {expandedSections[key] &&
                items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.filterItem}
                    onPress={() => toggleItem(key, item.id)}
                  >
                    <Checkbox
                      value={(localSelected[key] || []).includes(item.id)}
                      color={(localSelected[key] || []).includes(item.id) ? '#800080' : undefined}
                    />
                    <ThemedText style={styles.filterItemText}>{item.name}</ThemedText>
                    {item.code && <View style={[styles.colorDot, { backgroundColor: item.code }]} />}
                  </TouchableOpacity>
                ))}
            </View>
          ))}

          {options.bounds && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('price')}
              >
                <ThemedText style={styles.sectionTitle}>
                  Price (${priceRange[0]} - ${priceRange[1]})
                </ThemedText>
                <Ionicons
                  name={expandedSections['price'] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                />
              </TouchableOpacity>
              {expandedSections['price'] && (
                <Slider
                  minimumValue={options.bounds.priceMin}
                  maximumValue={options.bounds.priceMax}
                  step={1}
                  value={priceRange[1]}
                  onValueChange={value => setPriceRange([priceRange[0], value])}
                />
              )}
            </View>
          )}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <ThemedText style={styles.resetText}>Reset</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <ThemedText style={styles.applyText}>Apply</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: { margin: 0, justifyContent: 'flex-start' },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    height: SCREEN_HEIGHT,
    backgroundColor: '#fafafa',
    padding: 20,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  scrollContainer: { paddingBottom: 40 },
  section: { marginBottom: 15 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  filterItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  filterItemText: { marginLeft: 8, fontSize: 15 },
  colorDot: { width: 16, height: 16, borderRadius: 8, marginLeft: 10 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  resetButton: { paddingHorizontal: 30, paddingVertical: 10, backgroundColor: '#e0e0e0', borderRadius: 6 },
  applyButton: { paddingHorizontal: 30, paddingVertical: 10, backgroundColor: '#800080', borderRadius: 6 },
  resetText: { color: '#333', fontWeight: '600' },
  applyText: { color: '#fff', fontWeight: '600' },
});

export default FilterModal;
