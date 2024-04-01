import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, ToastAndroid } from 'react-native';import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const App = () => {
  const [todoItems, setTodoItems] = useState([]);
  const [inputText, setInputText] = useState('');
  const [subTaskInputText, setSubTaskInputText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedSubTaskId, setSelectedSubTaskId] = useState(null);

  useEffect(() => {
    loadTodoItems();
  }, []);

  const loadTodoItems = async () => {
    try {
      const storedTodoItems = await AsyncStorage.getItem('todoItems');
      if (storedTodoItems !== null) {
        setTodoItems(JSON.parse(storedTodoItems));
      }
    } catch (error) {
      console.log('Error loading todo items:', error);
    }
  };

  const saveTodoItems = async () => {
    try {
      await AsyncStorage.setItem('todoItems', JSON.stringify(todoItems));
    } catch (error) {
      console.log('Error saving todo items:', error);
    }
  };

  const addTodoItem = () => {
    if (inputText.trim() !== '') {
      const newItem = {
        id: Date.now().toString(),
        text: inputText,
        completed: false,
        date: new Date().toLocaleDateString(),
        subTasks: [],
        expanded: false, // Add the expanded property
      };
      setTodoItems([...todoItems, newItem]);
      setInputText('');
      saveTodoItems();
    }
  };

  const toggleTodoItem = (id) => {
    const updatedTodoItems = todoItems.map((item) => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    setTodoItems(updatedTodoItems);
    saveTodoItems();
  };

  const deleteTodoItem = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            const updatedTodoItems = todoItems.filter((item) => item.id !== id);
            setTodoItems(updatedTodoItems);
            saveTodoItems();
            ToastAndroid.show('Item deleted successfully', ToastAndroid.SHORT);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleSubTask = (todoItemId, subTaskId) => {
    const updatedTodoItems = todoItems.map((item) => {
      if (item.id === todoItemId) {
        const updatedSubTasks = item.subTasks.map((subTask) => {
          if (subTask.id === subTaskId) {
            return { ...subTask, completed: !subTask.completed };
          }
          return subTask;
        });
        return { ...item, subTasks: updatedSubTasks };
      }
      return item;
    });
    setTodoItems(updatedTodoItems);
    saveTodoItems();
  };

  const addSubTask = (todoItemId) => {
    if (subTaskInputText.trim() !== '') {
      const newSubTask = {
        id: Date.now().toString(),
        text: subTaskInputText,
        completed: false,
      };
      const updatedTodoItems = todoItems.map((item) => {
        if (item.id === todoItemId) {
          return { ...item, subTasks: [...item.subTasks, newSubTask] };
        }
        return item;
      });
      setTodoItems(updatedTodoItems);
      setSubTaskInputText('');
      saveTodoItems();
    }
  };

  const setAlarm = (taskId, subTaskId = null) => {
    if (subTaskId) {
      setSelectedSubTaskId(subTaskId);
    } else {
      setSelectedTaskId(taskId);
    }
    setShowDatePicker(true);
  };

  const handleAlarmSet = (selectedDate) => {
    setShowDatePicker(false);

    if (selectedDate) {
      const alarmTime = selectedDate.toLocaleString();

      const updatedTodoItems = todoItems.map((item) => {
        if (item.id === selectedTaskId) {
          if (selectedSubTaskId) {
            const updatedSubTasks = item.subTasks.map((subTask) => {
              if (subTask.id === selectedSubTaskId) {
                return { ...subTask, alarmTime };
              }
              return subTask;
            });
            return { ...item, subTasks: updatedSubTasks };
          } else {
            return { ...item, alarmTime };
          }
        }
        return item;
      });

      setTodoItems(updatedTodoItems);
      saveTodoItems();
    }

    setSelectedTaskId(null);
    setSelectedSubTaskId(null);
  };
  const toggleExpandCollapse = (id) => {
    const updatedTodoItems = todoItems.map((item) => {
      if (item.id === id) {
        return { ...item, expanded: !item.expanded };
      }
      return item;
    });
    setTodoItems(updatedTodoItems);
  };
  const TodoItem = ({ item, onToggle, onDelete, onSetAlarm, onToggleExpand }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={[styles.radioButton, item.completed && styles.completedRadioButton]}
        onPress={onToggle}
      >
        <View style={[styles.radioButtonIcon, item.completed && styles.completedRadioButtonIcon]} />
      </TouchableOpacity>
      <Text style={[styles.todoText, item.completed && styles.completedTodoText]}>{item.text}</Text>
      <TouchableOpacity style={styles.expandButton} onPress={onToggleExpand}>
        <Text style={styles.expandButtonText}>{item.expanded ? '-' : '+'}</Text>
      </TouchableOpacity>
      {item.expanded && (
        <>
          <Text style={styles.dateText}>{item.date}</Text>
          <TouchableOpacity style={styles.alarmButton} onPress={onSetAlarm}>
            <Text style={styles.alarmButtonText}>Set Alarm</Text>
          </TouchableOpacity>
          {item.alarmTime && <Text style={styles.alarmText}>{item.alarmTime}</Text>}
        </>
      )}
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const SubTaskItem = ({ subTask, onToggle, onSetAlarm }) => (
    <View style={styles.subTaskItem}>
      <TouchableOpacity
        style={[styles.subTaskRadioButton, subTask.completed && styles.completedSubTaskRadioButton]}
        onPress={onToggle}
      >
        <View style={[styles.subTaskRadioButtonIcon, subTask.completed && styles.completedSubTaskRadioButtonIcon]} />
      </TouchableOpacity>
      <Text style={[styles.subTaskText, subTask.completed && styles.completedSubTaskText]}>{subTask.text}</Text>
      <TouchableOpacity style={styles.subTaskAlarmButton} onPress={onSetAlarm}>
        <Text style={styles.subTaskAlarmButtonText}>Set Alarm</Text>
      </TouchableOpacity>
      {subTask.alarmTime && <Text style={styles.subTaskAlarmText}>{subTask.alarmTime}</Text>}
    </View>
  );

  const renderTodoItem = ({ item }) => (
    <>
      <TodoItem
        item={item}
        onToggle={() => toggleTodoItem(item.id)}
        onDelete={() => deleteTodoItem(item.id)}
        onSetAlarm={() => setAlarm(item.id)}
        onToggleExpand={() => toggleExpandCollapse(item.id)}
      />
      {item.expanded && (
        <View style={styles.subTasksContainer}>
          {item.subTasks.map((subTask) => (
            <SubTaskItem
              key={subTask.id}
              subTask={subTask}
              onToggle={() => toggleSubTask(item.id, subTask.id)}
              onSetAlarm={() => setAlarm(item.id, subTask.id)}
            />
          ))}
          <TextInput
            style={styles.subTaskInput}
            placeholder="Add sub-task"
            value={subTaskInputText}
            onChangeText={setSubTaskInputText}
            onSubmitEditing={() => addSubTask(item.id)}
          />
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodoItem}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todoItems}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id}
      />
      {showDatePicker && (
        <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        onConfirm={handleAlarmSet}
        onCancel={() => setShowDatePicker(false)}
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  completedRadioButton: {
    borderColor: 'green',
  },
  radioButtonIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  completedRadioButtonIcon: {
    backgroundColor: 'green',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    color: '#ccc',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  subTasksContainer: {
    marginLeft: 20,
    marginBottom: 10,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  subTaskRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  completedSubTaskRadioButton: {
    borderColor: 'green',
  },
  subTaskRadioButtonIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  completedSubTaskRadioButtonIcon: {
    backgroundColor: 'green',
  },
  subTaskText: {
    flex: 1,
    fontSize: 14,
  },
  completedSubTaskText: {
    textDecorationLine: 'line-through',
    color: '#ccc',
  },
  subTaskInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  alarmButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  alarmButtonText: {
    color: 'white',
    fontSize: 12,
  },
  alarmText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
  subTaskAlarmButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  subTaskAlarmButtonText: {
    color: 'white',
    fontSize: 12,
  },
  subTaskAlarmText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
  expandButton: {
    backgroundColor: 'gray',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  expandButtonText: {
    color: 'white',
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
});

export default App;