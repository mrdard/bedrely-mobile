import React, {useState} from 'react';
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
  ScrollView,
} from 'react-native';

interface AddChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, frequency: 'daily' | 'weekly', goal: number) => void;
}

const AddChallengeModal: React.FC<AddChallengeModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [goal, setGoal] = useState('50');

  const handleSave = () => {
    if (!name.trim() || !goal) {
      return;
    }

    const goalNum = parseInt(goal, 10);
    if (isNaN(goalNum) || goalNum <= 0) {
      return;
    }

    onSave(name.trim(), frequency, goalNum);

    // Reset form
    setName('');
    setFrequency('daily');
    setGoal('50');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setFrequency('daily');
    setGoal('50');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>New Challenge</Text>
              <TouchableOpacity onPress={handleSave} disabled={!name.trim() || !goal}>
                <Text style={[styles.saveButton, (!name.trim() || !goal) && styles.saveButtonDisabled]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Challenge Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Push-ups, Running, Reading"
                placeholderTextColor="#666"
                autoFocus
                maxLength={50}
              />
            </View>

            {/* Frequency Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequency</Text>
              <View style={styles.frequencyButtons}>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'daily' && styles.frequencyButtonSelected,
                  ]}
                  onPress={() => setFrequency('daily')}>
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      frequency === 'daily' && styles.frequencyButtonTextSelected,
                    ]}>
                    Daily
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === 'weekly' && styles.frequencyButtonSelected,
                  ]}
                  onPress={() => setFrequency('weekly')}>
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      frequency === 'weekly' && styles.frequencyButtonTextSelected,
                    ]}>
                    Weekly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Goal Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Daily Goal {frequency === 'weekly' && '(per week)'}
              </Text>
              <TextInput
                style={styles.input}
                value={goal}
                onChangeText={setGoal}
                placeholder="e.g., 50, 100, 200"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                maxLength={5}
              />
              <Text style={styles.hint}>
                How many reps/minutes/units do you want to complete each {frequency === 'daily' ? 'day' : 'week'}?
              </Text>
            </View>

            {/* Example */}
            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>💡 Example</Text>
              <Text style={styles.exampleText}>
                Challenge: "Push-ups"{'\n'}
                Frequency: Daily{'\n'}
                Goal: 100 reps/day{'\n\n'}
                You'll track your progress each day and see your weekly chart!
              </Text>
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  saveButtonDisabled: {
    color: '#4B5563',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  hint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  frequencyButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#1a2a1f',
  },
  frequencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  frequencyButtonTextSelected: {
    color: '#10b981',
  },
  exampleBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});

export default AddChallengeModal;
