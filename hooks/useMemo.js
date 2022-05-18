import React, {useState, useMemo} from 'react';
import {Button, View, Text} from 'react-native';

const App = () => {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);
  const calculation = useMemo(() => expensiveCalculation(count), [count]);

  const increment = () => {
    setCount(c => c + 1);
  };
  const addTodo = () => {
    setTodos(t => [...t, 'New Todo']);
  };

  return (
    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
      <View>
        <Text>My Todos</Text>
        {todos.map((todo, index) => {
          return <Text key={index}>{todo}</Text>;
        })}
        <Button onPress={addTodo} title={'Add Todo'}></Button>
      </View>
      <View>
        <Text>Count: {count}</Text>
        <Button onPress={increment} title={'+'}></Button>
        <Text>Expensive Calculation</Text>
        <Text>{calculation}</Text>
      </View>
    </View>
  );
};
const expensiveCalculation = num => {
  console.log('Calculating...');
  for (let i = 0; i < 1000000000; i++) {
    num += 1;
  }
  return num;
};

export default App;
