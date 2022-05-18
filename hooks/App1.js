//import liraries
import {View, Text, StyleSheet, Button} from 'react-native';
import React, {useState, useCallback} from 'react';
import Todos from './Todos';

// create a component
const MyComponent = () => {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);

  const increment = () => {
    setCount(c => c + 1);
  };
  const addTodo = useCallback(() => {
    setTodos(t => [...t, 'New Todo']);
  }, [todos]);

  // const addTodo = () => {
  //   setTodos(t => [...t, 'New Todo']);
  // };
  return (
    <View style={styles.container}>
      <Todos todos={todos} addTodo={addTodo} />
      <Text> Count: {count}</Text>
      <Button onPress={increment} title={'+'}></Button>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

//make this component available to the app
export default MyComponent;
