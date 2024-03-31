import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, ToastAndroid } from 'react-native';

export default function App() {
  const [todoItems, setTodoItems] = useState([]);
  const [inputText, setInputText] = useState('');

  

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
        date: new Date().toLocaleDateString(), // Add the current date
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

  const renderTodoItem = ({ item }) => (
    <View style={styles.todoItem}>
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
    </View>
  );
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
});