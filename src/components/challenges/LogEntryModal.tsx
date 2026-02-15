import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ConfettiCannon from 'react-native-confetti-cannon';
import {Challenge} from '../../models/Challenge';
import {formatDate} from '../../models/Challenge';

interface LogEntryModalProps {
  visible: boolean;
  challenge: Challenge | null;
  onClose: () => void;
  onSave: (value: number, date: string) => void;
  currentDayTotal?: number; // Current total for the selected day
}

const LogEntryModal: React.FC<LogEntryModalProps> = ({
  visible,
  challenge,
  onClose,
  onSave,
  currentDayTotal = 0,
}) => {
  const [value, setValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const confettiRef = useRef<any>(null);

  const handleSave = () => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0) {
      console.log('❌ [LogEntryModal] Invalid value:', value);
      return;
    }

    const dateStr = formatDate(selectedDate);
    console.log('✅ [LogEntryModal] Saving entry:', {
      challenge: challenge?.originalName,
      value: numValue,
      date: dateStr,
    });

    // Check if goal is reached with this entry
    if (challenge?.goal) {
      const newTotal = currentDayTotal + numValue;
      const previousTotal = currentDayTotal;

      console.log('🎯 [LogEntryModal] Goal check:', {
        goal: challenge.goal,
        previousTotal,
        newTotal,
        goalReached: previousTotal < challenge.goal && newTotal >= challenge.goal,
      });

      // Trigger confetti if goal was just achieved
      if (previousTotal < challenge.goal && newTotal >= challenge.goal) {
        console.log('🎉 [LogEntryModal] GOAL REACHED! Triggering confetti!');
        confettiRef.current?.start();
      }
    }

    onSave(numValue, dateStr);
    setValue('');
    setSelectedDate(new Date());

    // Close modal after a delay if confetti was triggered
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClose = () => {
    setValue('');
    setSelectedDate(new Date());
    onClose();
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Get unit based on challenge type
  const unit = challenge?.goalType === 'minutes' ? 'min' : 'reps';
  const unitLabel = challenge?.goalType === 'minutes' ? 'minutes' : 'reps/units';

  const quickValues = [10, 25, 50, 100];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.modal}>
            {/* Confetti */}
            <ConfettiCannon
              ref={confettiRef}
              count={200}
              origin={{x: -10, y: 0}}
              autoStart={false}
              fadeOut={true}
              fallSpeed={3000}
            />
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Log Entry</Text>
              <Text style={styles.subtitle}>{challenge?.originalName}</Text>
            </View>

            {/* Value Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>
                How many {unitLabel}?
                {challenge?.goal && ` (Goal: ${challenge.goal} ${unit})`}
              </Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                placeholder={`Enter ${unit}`}
                placeholderTextColor="#666"
                keyboardType="number-pad"
                autoFocus
                maxLength={5}
              />
            </View>

            {/* Quick Values */}
            <View style={styles.quickValuesSection}>
              <Text style={styles.quickLabel}>Quick Add:</Text>
              <View style={styles.quickButtons}>
                {quickValues.map(val => (
                  <TouchableOpacity
                    key={val}
                    style={styles.quickButton}
                    onPress={() => {
                      const currentValue = parseInt(value || '0', 10);
                      setValue((currentValue + val).toString());
                    }}>
                    <Text style={styles.quickButtonText}>+{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Picker */}
            <View style={styles.dateSection}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={handlePreviousDay}>
                  <Text style={styles.arrowText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
                  {isToday && <Text style={styles.todayBadge}>Today</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.arrowButton, isToday && styles.arrowButtonDisabled]}
                  onPress={handleNextDay}
                  disabled={isToday}>
                  <Text style={[styles.arrowText, isToday && styles.arrowTextDisabled]}>›</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                />
              )}
            </View>

            {/* Spacer to push button to bottom */}
            <View style={{flex: 1}} />

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                !value && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!value}>
              <Text style={styles.saveButtonText}>💪 SAVE</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardView: {
    flex: 1,
  },
  modal: {
    flex: 1,
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  quickValuesSection: {
    marginBottom: 24,
  },
  quickLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#2a2a2a',
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  dateSection: {
    marginBottom: 24,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  arrowTextDisabled: {
    color: '#666',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  todayBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 2,
  },
});

export default LogEntryModal;
