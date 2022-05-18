//import liraries
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Image,
  TouchableOpacity,
  LogBox,
} from 'react-native';
import styles from './style';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

// create a component
const MyComponent = props => {
  const [data, setdata] = useState([]);
  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    await firestore()
      .collection('Users')
      .where('uid', '!=', auth().currentUser.uid)
      .get()
      .then(querySnapshot => {
        console.log('Total users: ', querySnapshot.size);
        const arr = [];
        querySnapshot.forEach(documentSnapshot => {
          console.log(documentSnapshot.data());
          arr.push(documentSnapshot.data());
        });
        setdata(arr);
      });
  };
  const renderItem = ({item}) => (
    <View>
      <TouchableOpacity
        style={styles.item}
        onPress={() => props.navigation.navigate('Chat', {userDetail: item})}>
        <Image
          source={require('../../Assets/Images/user.png')}
          style={styles.imgItem}
        />
        <View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.title}>{item.email}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.line} />
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerView}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Image
            source={require('../../Assets/Images/arrow.png')}
            style={{height: 20, width: 20, tintColor: 'white', marginRight: 25}}
          />
        </TouchableOpacity>
        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
          Select Contact
        </Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

//make this component available to the app
export default MyComponent;
