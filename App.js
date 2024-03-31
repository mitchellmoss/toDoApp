import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ToastAndroid } from 'react-native';

export default function App() {
  const [todoItems, setTodoItems] = useState([]);
  const [inputText, setInputText] = useState('');
  const [subTaskInputText, setSubTaskInputText] = useState('');

  

  useEffect(() => {
    loadTodoItems();
  }, []);

  const loadTodoItems = async () => {
    try {
      const storedTodoItems = await AsyncStorage.getItem('todoItems');
      if (storedTodoItems !== null) {
        const parsedTodoItems = JSON.parse(storedTodoItems);
        const updatedTodoItems = parsedTodoItems.map((item) => ({
          ...item,
          subTasks: item.subTasks || [], // Initialize subTasks if not present
        }));
        setTodoItems(updatedTodoItems);
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
        subTasks: [], // Initialize subTasks as an empty array
        expanded: false,
      };
      setTodoItems([...todoItems, newItem]);
      setInputText('');
      saveTodoItems();
    }
  };
  const SubTaskItem = ({ subTask, onToggle }) => (
    <View style={styles.subTaskItem}>
      <TouchableOpacity
        style={[styles.subTaskRadioButton, subTask.completed && styles.completedSubTaskRadioButton]}
        onPress={onToggle}
      >
        <View style={[styles.subTaskRadioButtonIcon, subTask.completed && styles.completedSubTaskRadioButtonIcon]} />
      </TouchableOpacity>
      <Text style={[styles.subTaskText, subTask.completed && styles.completedSubTaskText]}>
        {subTask.text}
      </Text>
    </View>
  );
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

  const renderTodoItem = ({ item }) => (
    <>
      <TouchableOpacity style={styles.todoItem} onPress={() => toggleExpandCollapse(item.id)}>
        <TouchableOpacity
          style={[styles.radioButton, item.completed && styles.completedRadioButton]}
          onPress={() => toggleTodoItem(item.id)}
        >
          <View style={[styles.radioButtonIcon, item.completed && styles.completedRadioButtonIcon]} />
        </TouchableOpacity>
        <Text style={[styles.todoText, item.completed && styles.completedTodoText]}>
          {item.text}
        </Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        {item.completed && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {item.expanded && (
      <View style={styles.subTasksContainer}>
        {item.subTasks.map((subTask) => (
          <SubTaskItem
            key={subTask.id}
            subTask={subTask}
            onToggle={() => toggleSubTask(item.id, subTask.id)}
          />
        ))}
        <TextInput
          style={styles.subTaskInput}
          placeholder="Add sub-task"
          value={subTaskInputText}
          onChangeText={setSubTaskInputText}
          onSubmitEditing={() => {
            addSubTask(item.id);
            setSubTaskInputText('');
          }}
        />
      </View>
    )}
  </>
);
  const toggleExpandCollapse = (id) => {
    const updatedTodoItems = todoItems.map((item) => {
      if (item.id === id) {
        return { ...item, expanded: !item.expanded };
      }
      return item;
    });
    setTodoItems(updatedTodoItems);
  };
  
  const toggleSubTask = (todoItemId, subTaskId) => {
    const updatedTodoItems
  
   = todoItems.map((item) => {
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
      saveTodoItems();
    }
  };
  const confirmDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteTodoItem(id),
        },
      ],
      { cancelable: true }
    );
  };
  const deleteTodoItem = (id) => {
    const updatedTodoItems = todoItems.filter((item) => item.id !== id);
    setTodoItems(updatedTodoItems);
    saveTodoItems();
    ToastAndroid.show('Task deleted successfully', ToastAndroid.SHORT);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a to-do item"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodoItem}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todoItems}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 204, 1)', // Light yellow color with full opacity
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
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#7FDEEA',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
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
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  completedRadioButton: {
    borderColor: '#A8DEA2',
  },
  radioButtonIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  completedRadioButtonIcon: {
    backgroundColor: '#A8DEA2',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  subTasksContainer: {
    marginLeft: 20,
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
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  completedSubTaskRadioButton: {
    borderColor: 'blue',
  },
  subTaskRadioButtonIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  completedSubTaskRadioButtonIcon: {
    backgroundColor: 'blue',
  },
  subTaskText: {
    fontSize: 14,
  },
  completedSubTaskText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  subTaskInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 5,
    paddingHorizontal: 10,
  },
});