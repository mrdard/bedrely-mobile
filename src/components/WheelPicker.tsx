import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

interface WheelPickerOption {
  label: string;
  value: number;
}

interface WheelPickerProps {
  options: WheelPickerOption[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  color?: string;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

const WheelPicker: React.FC<WheelPickerProps> = ({
  options,
  selectedValue,
  onValueChange,
  color = '#6366f1',
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [initialized, setInitialized] = useState(false);

  // Find initial index
  const getSelectedIndex = (value: number): number => {
    const index = options.findIndex(opt => opt.value === value);
    return index >= 0 ? index : 0;
  };

  useEffect(() => {
    if (!initialized && scrollViewRef.current) {
      // Scroll to selected value on mount
      const selectedIndex = getSelectedIndex(selectedValue);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
        setInitialized(true);
      }, 100);
    }
  }, [initialized, selectedValue]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));

    if (options[clampedIndex] && options[clampedIndex].value !== selectedValue) {
      onValueChange(options[clampedIndex].value);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));

    // Snap to exact position
    scrollViewRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* Selection highlight */}
      <View style={[styles.selectionOverlay, {borderColor: color}]} />

      {/* Fade gradients */}
      <View style={[styles.fadeTop, styles.fade]} />
      <View style={[styles.fadeBottom, styles.fade]} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}>
        {/* Top padding */}
        <View style={{height: ITEM_HEIGHT * 2}} />

        {/* Options */}
        {options.map((option, index) => {
          const isSelected = option.value === selectedValue;
          return (
            <View key={option.value} style={[styles.item, {height: ITEM_HEIGHT}]}>
              <Text
                style={[
                  styles.itemText,
                  isSelected && styles.itemTextSelected,
                  isSelected && {color},
                ]}>
                {option.label}
              </Text>
            </View>
          );
        })}

        {/* Bottom padding */}
        <View style={{height: ITEM_HEIGHT * 2}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '400',
  },
  itemTextSelected: {
    fontSize: 28,
    fontWeight: '700',
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    zIndex: 1,
    pointerEvents: 'none',
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    zIndex: 2,
    pointerEvents: 'none',
  },
  fadeTop: {
    top: 0,
    backgroundColor: 'transparent',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)',
  },
  fadeBottom: {
    bottom: 0,
    backgroundColor: 'transparent',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
  },
});

export default WheelPicker;
