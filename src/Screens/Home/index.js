//import liraries
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  LogBox,
  FlatList,
  AppState,
  Keyboard,
} from 'react-native';
import styles from './style';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {FloatingAction} from 'react-native-floating-action';
import moment from 'moment';
import crashlytics from '@react-native-firebase/crashlytics';
import dynamicLinks from '@react-native-firebase/dynamic-links';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

// create a component
const MyComponent = props => {
  const [data, setdata] = useState([]);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  useEffect(() => {
    crashlytics().log('App mounted.');
    // logCrash();
  }, []);

  useEffect(() => {
    // When the component is unmounted, remove the listener
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    // When the component is unmounted, remove the listener
    const unsubscribe = dynamicLinks()
      .getInitialLink()
      .then(link => {
        handleDynamicLink(link);
      });
    return () => unsubscribe();
  }, []);

  const handleDynamicLink = link => {
    // Handle dynamic link inside your own application
    if (link) {
      let regex = /[?&]([^=#]+)=([^&#]*)/g,
        params = {},
        match;
      while ((match = regex.exec(link.url))) {
        params[match[1]] = match[2];
      }
      console.log("params['path']", params['path'] + params['id']);
    }
  };

  const logCrash = async () => {
    crashlytics().crash();
  };
  useEffect(() => {
    onlineUsers();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, [appStateVisible]);
  useEffect(() => {
    getData();
  }, []);
  const onlineUsers = async () => {
    const myData = {
      onlineStatus: appStateVisible,
      uid: auth().currentUser.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    firestore()
      .collection('OnlineUsers')
      .doc(auth().currentUser.uid)
      .set(myData);
  };
  const getData = async () => {
    firestore()
      .collection('lookup_users_chatlist')
      .doc(auth().currentUser.uid)
      .collection('chatlist')
      .onSnapshot(querySnapshot => {
        const arr = [];
        querySnapshot?.forEach(item => {
          const data = {
            ...item.data(),
            id: item.id,
          };
          arr.push(data);
        });
        setdata(arr);
      });
  };
  const actions = [
    {
      text: 'New Chat',
      icon: require('../../Assets/Images/comment.png'),
      name: 'New Chat',
      position: 1,
      color: 'green',
    },
    {
      text: 'Logout',
      icon: require('../../Assets/Images/power-off.png'),
      name: 'Logout',
      position: 2,
      color: 'green',
    },
  ];
  const onSignout = () => {
    auth()
      .signOut()
      .then(() => {
        console.log('User signed out!');
        props.navigation.navigate('Login');
      });
  };
  const renderItem = ({item}) => {
    return (
      <View>
        <TouchableOpacity
          style={styles.item}
          onPress={() => props.navigation.navigate('Chat', {userDetail: item})}>
          <Image
            source={require('../../Assets/Images/user.png')}
            style={styles.imgItem}
          />
          <View style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
              }}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.title1}>
                {moment(item?.createdAt?.toDate()?.toString()).format(
                  'hh:mm a',
                )}
              </Text>
            </View>
            {item?.isTyping == true ? (
              <Text style={styles.typingText}>{'Typing...'}</Text>
            ) : (
              <Text style={styles.title1}>{item.lastMsg}</Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.line} />
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerView}>
        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
          Chat
        </Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <FloatingAction
        actions={actions}
        color={'green'}
        onPressItem={name => {
          console.log(`selected button: ${name}`);
          if (name == 'Logout') {
            onSignout();
          } else if (name == 'New Chat') {
            props.navigation.navigate('UserList');
          }
        }}
      />
    </SafeAreaView>
  );
};

//make this component available to the app
export default MyComponent;
