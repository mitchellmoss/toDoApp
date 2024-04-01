import DateTimePicker from '@react-native-community/datetimepicker';

const AlarmPicker = ({ visible, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.alarmPickerContainer}>
        <View style={styles.alarmPickerContent}>
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
          />
          <View style={styles.alarmPickerButtons}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Confirm" onPress={() => onConfirm(selectedDate)} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  alarmPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alarmPickerContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  alarmPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

