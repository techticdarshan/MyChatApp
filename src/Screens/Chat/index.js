import React, {useState, useCallback, useEffect} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  View,
  SafeAreaView,
  Image,
  Text,
  TouchableOpacity,
  LogBox,
  TextInput,
} from 'react-native';
import styles from './style';
import moment from 'moment';
import dynamicLinks from '@react-native-firebase/dynamic-links';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

const MyComponent = props => {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isLastSeen, setIsLastSeen] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    const docid =
      props.route.params.userDetail.uid > auth().currentUser.uid
        ? auth().currentUser.uid + '-' + props.route.params.userDetail.uid
        : props.route.params.userDetail.uid + '-' + auth().currentUser.uid;

    firestore()
      .collection('Chats')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const messages = querySnapshot.docs.map(doc => {
          return {
            ...doc.data(),
            createdAt: doc?.data()?.createdAt?.toDate(),
          };
        });
        setMessages(messages);
      });

    firestore()
      .collection('lookup_users_chatlist')
      .doc(auth().currentUser.uid)
      .collection('chatlist')
      .doc(props.route.params.userDetail.uid)
      .onSnapshot(querySnapshot => {
        setTyping(querySnapshot?.data()?.isTyping);
      });

    firestore()
      .collection('OnlineUsers')
      .doc(props.route.params.userDetail.uid)
      .onSnapshot(querySnapshot => {
        console.log('online status', querySnapshot?.data()?.onlineStatus);
        setIsOnline(querySnapshot?.data()?.onlineStatus);
        setIsLastSeen(querySnapshot?.data()?.createdAt);
      });
  };

  const onSend = useCallback((messages = []) => {
    console.log('messages', messages);
    console.log(
      'props.route.params.userDetail.uid',
      props.route.params.userDetail.uid,
    );
    setText('');
    const msg = messages[0];
    const mymsg = {
      ...msg,
      sendBy: auth().currentUser.uid,
      sendTo: props.route.params.userDetail.uid,
      createdAt: new Date(),
    };
    const docid =
      props.route.params.userDetail.uid > auth().currentUser.uid
        ? auth().currentUser.uid + '-' + props.route.params.userDetail.uid
        : props.route.params.userDetail.uid + '-' + auth().currentUser.uid;
    firestore()
      .collection('Chats')
      .doc(docid)
      .collection('messages')
      .add({
        ...mymsg,
        createdAt: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        console.warn('Send successfully');
      });

    firestore()
      .collection('lookup_users_chatlist')
      .doc(auth().currentUser.uid)
      .collection('chatlist')
      .doc(props.route.params.userDetail.uid)
      .set({
        name: props.route.params.userDetail.name,
        lastMsg: messages[0]?.text,
        createdAt: firestore.FieldValue.serverTimestamp(),
        uid: props.route.params.userDetail.uid,
        isTyping: false,
      });

    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );

    firestore()
      .collection('UserFcmToken')
      .doc(props.route.params.userDetail.uid)
      .onSnapshot(querySnapshot => {
        console.log('tokenGet', querySnapshot.data().notification_token);
        fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'key=AAAA-92ks1I:APA91bF4TyIdWo9LQJ9DNafphJAzUeg216Pv2drUMq74UVQkCDuMR1D4u8XTVqusPzCCzBpMxKhAjAIjB9ZeIhE858TmUdZwKWov2qYwnIXZVcNwWs2YVtRi-ll9556xIdlZ2qhZwWiz',
          },
          body: JSON.stringify({
            to: querySnapshot.data().notification_token,
            notification: {
              title: props.route.params.userDetail.name,
              body: messages[0]?.text,
              mutable_content: true,
              sound: 'Tri-tone',
            },
            // data: {
            //   url: '<url of media image>',
            //   dl: '<deeplink action on tap of notification>',
            // },
          }),
        })
          .then(response => response.json())
          .then(res => {
            console.log('notification response', res);
            return res;
          })
          .catch(err => {
            console.log('error:', err?.response || err);
            throw err?.response || err;
          });
      });
  }, []);

  const changeTextMethod = text => {
    if (text.length > 0) {
      firestore()
        .collection('lookup_users_chatlist')
        .doc(props.route.params.userDetail.uid)
        .collection('chatlist')
        .doc(auth().currentUser.uid)
        .update({
          isTyping: true,
        });
    } else {
      firestore()
        .collection('lookup_users_chatlist')
        .doc(props.route.params.userDetail.uid)
        .collection('chatlist')
        .doc(auth().currentUser.uid)
        .update({
          isTyping: false,
        });
    }
  };

  const chooseFile = type => {
    let options = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
      maxWidth: 300,
      maxHeight: 300,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        //alert("User cancelled camera picker");
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      const source = {uri: response.assets[0].uri};
      console.log(source);
      uploadImage(response.assets[0].uri);
    });
  };
  const uploadImage = async image => {
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;
    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);
    task.on('state_changed', taskSnapshot => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );
    });
    try {
      await task;
      const url = await storageRef.getDownloadURL();
      console.log('url:----', url);
      onSend([
        {
          _id: Math.floor(Math.random() * 78744545) + 54454545,
          createdAt: firestore.FieldValue.serverTimestamp(),
          user: {
            _id: auth().currentUser.uid,
          },
          image: url,
        },
      ]);
    } catch (e) {
      console.log(e);
    }
  };
  async function shareFile() {
    const link = await dynamicLinks().buildLink({
      link: 'https://mychatapp99.page.link/qL6j',
      // domainUriPrefix is created in your Firebase console
      domainUriPrefix: 'https://mychatapp99.page.link',
      // optional set up which updates Firebase analytics campaign
      // "banner". This also needs setting up before hand
      android: {packageName: 'com.mychatapp'},
      analytics: {
        campaign: 'banner',
      },
    });
    console.log('link', link);

    return link;
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.headerView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Image
              source={require('../../Assets/Images/arrow.png')}
              style={{
                height: 20,
                width: 20,
                tintColor: 'white',
                marginRight: 25,
              }}
            />
          </TouchableOpacity>
          <Image
            source={require('../../Assets/Images/user.png')}
            style={styles.imgItem}
          />
          <View>
            <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
              {props.route.params.userDetail.name}
            </Text>
            {typing ? (
              <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
                {'Typing...'}
              </Text>
            ) : isOnline == 'active' ? (
              <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
                {'Online'}
              </Text>
            ) : isLastSeen ? (
              <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
                {'Last seen ' +
                  moment(isLastSeen?.toDate()?.toString()).format('hh:mm a')}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => chooseFile()}
            style={{alignSelf: 'center'}}>
            <Image
              source={require('../../Assets/Images/image.png')}
              style={{height: 30, width: 30, marginRight: 20}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => shareFile()}
            style={{alignSelf: 'center'}}>
            <Image
              source={require('../../Assets/Images/share.png')}
              style={{
                height: 25,
                width: 25,
                tintColor: '#fff',
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <GiftedChat
        isTyping={typing}
        messages={messages}
        onSend={messages => onSend(messages)}
        onInputTextChanged={text => changeTextMethod(text)}
        user={{
          _id: auth().currentUser.uid,
        }}
        // renderInputToolbar={props=>(
        //   <InputToolbar {...props} containerStyle={styles.chatInputcontainer}/>
        // )}
        // renderInputToolbar={props => (
        //   <View style={{flexDirection: 'row', flex: 1, marginHorizontal: 5}}>
        //     <TouchableOpacity
        //       onPress={() => chooseFile()}
        //       style={{alignSelf: 'center'}}>
        //       <Image
        //         source={require('../../Assets/Images/image.png')}
        //         style={{height: 30, width: 30}}
        //       />
        //     </TouchableOpacity>
        //     <TextInput
        //       style={{
        //         flex: 1,
        //         backgroundColor: 'white',
        //         paddingHorizontal: 20,
        //         marginHorizontal: 5,
        //         borderRadius: 20,
        //       }}
        //       value={text}
        //       onChangeText={text => {
        //         changeTextMethod(text);
        //         setText(text);
        //       }}
        //       placeholder={'Message'}
        //     />
        //     <TouchableOpacity
        //       style={{alignSelf: 'center'}}
        //       onPress={() => {
        //         props.onSend(messages);
        //       }}>
        //       <Text style={{fontSize: 16, fontWeight: 'bold', color: 'green'}}>
        //         Send
        //       </Text>
        //     </TouchableOpacity>
        //   </View>
        // )}
        // renderComposer={props=>(
        //   <Composer
        //     textInputStyle={StyleSheet.chattextstyle}
        //     placeholder="type new chat"
        //     {...props}
        //   />
        // )}
        // renderActions={messages=>micbtn(messages)}
        // timeTextStyle={StyleSheet.timetext}
        // renderBubble={renderBubble}
        alwaysShowSend
        renderAvatar={null}
        showUserAvatar={false}
        showAvatarForEveryMessage={false}
        // renderSend={renderSend}
        scrollToBottom
        // scrollToBottomComponent={scrollToBottomComponent}
      />
    </SafeAreaView>
  );
};
//make this component available to the app
export default MyComponent;
