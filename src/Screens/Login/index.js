//import liraries
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import styles from './style';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';

// create a component
const MyComponent = props => {
  const [value, setValue] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [newUser, setNewUser] = useState(false);

  useEffect(() => {
    crashlytics().log('App mounted.');
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }
  if (initializing) return null;
  if (user) {
    props.navigation.replace('Home');
  } else {
    props.navigation.navigate('Login');
  }

  const onLogin = async () => {
    if (email == '') {
      alert('Please enter your email');
    } else if (password == '') {
      alert('Please enter your password');
    } else {
      try {
        await auth()
          .signInWithEmailAndPassword(email, password)
          .then(resp => {
            console.log('resp:--', resp);
            crashlytics().setAttributes({
              email: email,
            });
            // if (additionalUserInfo.isNewUser == false) {
            //   setNewUser(true);
            // }
          })
          .catch(error => {
            setNewUser(true);
            crashlytics().recordError(error);
            console.log('error:--', error);
          });
      } catch (e) {
        crashlytics().recordError(e);
        console.log(e);
      }
    }
  };
  async function requestUserPermission(uid) {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      const token = await messaging().getToken();

      await messaging().registerDeviceForRemoteMessages();

      console.log('token Authorization status:', token);
      if (token) {
        firestore().collection('UserFcmToken').doc(uid).set({
          notification_token: token,
          created_at: Date.now(),
        });
      } else {
        alert("user doesn't have a device token yet");
      }
    }
  }
  const onSubmit = async () => {
    if (email == '') {
      alert('Please enter your email');
    } else if (password == '') {
      alert('Please enter your password');
    } else if (name == '') {
      alert('Please enter your name');
    } else if (value == '') {
      alert('please enter your phone no');
    } else {
      await auth()
        .createUserWithEmailAndPassword(email, password)
        .then(resp => {
          const myData = {
            name: name,
            email: email,
            phone: value,
            uid: resp.user.uid,
          };
          const userDocument = firestore().collection('Users').add(myData);
          console.log('userDocument', userDocument);
          console.log('User account created & signed in!', resp);
          requestUserPermission(resp.user.uid);
          props.navigation.replace('Home');
        })
        .catch(error => {
          if (error.code === 'auth/email-already-in-use') {
            console.log('That email address is already in use!');
          }

          if (error.code === 'auth/invalid-email') {
            console.log('That email address is invalid!');
          }

          console.error(error);
        });
    }
  };
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.headerView}>
        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
          Login
        </Text>
      </View>
      <View style={styles.container}>
        <TextInput
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.textInput}
          placeholder={'Enter email'}
        />
        <TextInput
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.textInput}
          placeholder={'Enter password'}
        />
        <TouchableOpacity style={styles.button} onPress={() => onLogin()}>
          <Text style={styles.text}>Verify</Text>
        </TouchableOpacity>
        {newUser && (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TextInput
              value={name}
              onChangeText={text => setName(text)}
              style={styles.textInput}
              placeholder={'Enter name'}
            />
            <PhoneInput
              defaultValue={value}
              defaultCode="IN"
              layout="first"
              onChangeText={text => {
                setValue(text);
              }}
              autoFocus
            />
            <TouchableOpacity style={styles.button} onPress={() => onSubmit()}>
              <Text style={styles.text}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

//make this component available to the app
export default MyComponent;
