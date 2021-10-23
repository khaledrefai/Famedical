import React, {useState, useEffect, useContext} from 'react';
import {
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  View,
  Button,
  StyleSheet,
} from 'react-native';
import moment from 'moment/min/moment-with-locales';
import {
  Container,
  Card,
  UserInfo,
  UserImgWrapper,
  UserImg,
  UserInfoText,
  UserName,
  PostTime,
  MessageText,
  TextSection,
} from '../styles/MessageStyles';

import {AuthContext} from '../navigation/AuthProvider';

import firestore from '@react-native-firebase/firestore';
import {
  Box,
  FlatList,
  Heading,
  Avatar,
  HStack,
  VStack,
  Text,
  Spacer,
  Center,
  NativeBaseProvider,
} from 'native-base';
import styles from '../styles/Common';
 

const FamilyScreen = ({navigation, route}) => {
  moment.locale('ar');

  const {user, logout} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [familyReq, setFamilyReq] = useState(null);
  const [loading, setLoading] = useState(true);

  const acceptReq = async (touser) =>{
    console.log("try to accept user ",touser);
    //update to user
    await firestore()
    .collection('users')
    .doc(touser)
    .get()
    .then((documentSnapshot) => {
      if (documentSnapshot.exists) {
     let i =   documentSnapshot.data().relatives.findIndex(x => x.toUser == user.uid);
      documentSnapshot.data().relatives[i].status="CONNECTED";
     documentSnapshot.data().relatives[i].requestDate = new Date();
     firestore()
     .collection('users')
     .doc(touser)
     .update({
       relatives: documentSnapshot.data().relatives,
     })
     .then(() => {
       console.log('to User relatives Updated!');
     });
      }
    });

     //update current user
   
      let i =   userData.relatives.findIndex(x => x.toUser == touser);
      userData.relatives[i].status="CONNECTED";
      userData.relatives[i].requestDate = new Date();
      firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        relatives: userData.relatives,
      })
      .then(() => {
        setUserData(userData);
        console.log('my User relatives Updated!');
      });
      

  }
  const rejectReq = async(touser)=>{
    console.log("try to del user ",touser);
    //update to user
    await firestore()
    .collection('users')
    .doc(touser)
    .get()
    .then((documentSnapshot) => {
      if (documentSnapshot.exists) {
     let i =   documentSnapshot.data().relatives.findIndex(x => x.toUser == user.uid);
      documentSnapshot.data().relatives.splice(i,1);
     firestore()
     .collection('users')
     .doc(touser)
     .update({
       relatives: documentSnapshot.data().relatives,
     })
     .then(() => {
       console.log('to User relatives deleted !');
     });
      }
    });

     //update current user
   
      let i =   userData.relatives.findIndex(x => x.toUser == touser);
       userData.relatives.splice(i,1);
      firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        relatives: userData.relatives,
      })
      .then(() => {
        setUserData(userData);
        console.log('my User relatives deleted!');
      });
      
  }
  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          console.log('User Data', documentSnapshot.data());
          setUserData(documentSnapshot.data());
          console.log(
            'User relaive ',
            documentSnapshot
              .data()
              .relatives.filter((r) => r.status != 'PEDING'),
          );

          if (loading) {
            setLoading(false);
          }
        }
      });
  };

  useEffect(() => {
    getUser();

    navigation.addListener('focus', () => setLoading(!loading));
  }, [navigation, loading]);

  return (
    <NativeBaseProvider>
      <Center flex={1} px="3">
        {loading || userData == null ? (
          <Image source={require('../assets/loading.gif')} />
        ) : (
          <React.Fragment>
            <FlatList
              data={userData.relatives.filter((r) => r.status == 'PENDING')}
              keyExtractor={(item) => item.toUser}
              renderItem={({item}) => (
                <Card
                  onPress={() =>
                    navigation.navigate('HomeProfile', {userId: item.toUser})
                  }>
                  <UserInfo>
                    <UserImgWrapper>
                      <UserImg
                        source={
                          item.toUserImg
                            ? item.toUserImg
                            : require('../assets/avatar.png')
                        }
                      />
                    </UserImgWrapper>
                    <TextSection>
                      <UserInfoText>
                        <UserName>{item.toUserName}</UserName>
                        <PostTime>{item.relationName}</PostTime>
                      </UserInfoText>
                      <MessageText>
                        <View style={styles.userBtnWrapper}>
                          <TouchableOpacity
                            style={styles.userBtn}
                            onPress={() => acceptReq(item.toUser)}>
                            <Text style={styles.userBtnTxt}>  قبول الطلب  </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.userBtn}
                            onPress={() => rejectReq(item.toUser)}>
                            <Text style={styles.userBtnTxt}>     رفض وحذف  </Text>
                          </TouchableOpacity>
                        </View>
                      </MessageText>
                    </TextSection>
                  </UserInfo>
                </Card>
              )}
            />
            <FlatList
              data={userData.relatives.filter((r) => r.status == 'REQ_SENT')}
              keyExtractor={(item) => item.toUser}
              renderItem={({item}) => (
                <Card
                  onPress={() =>
                    navigation.navigate('HomeProfile', {userId: item.toUser})
                  }>
                  <UserInfo>
                    <UserImgWrapper>
                      <UserImg
                        source={
                          item.toUserImg
                            ? item.toUserImg
                            : require('../assets/avatar.png')
                        }
                      />
                    </UserImgWrapper>
                    <TextSection>
                      <UserInfoText>
                        <UserName>{item.toUserName}</UserName>
                        <PostTime>{item.relationName}</PostTime>
                      </UserInfoText>
                        <MessageText>
                      <Text>   تم ارسال الطلب   
                         -     
                      { moment(item.requestDate.toDate()).fromNow() } 
                      </Text>
                      </MessageText>
                    </TextSection>
                  </UserInfo>
                </Card>
              )}
            />

            <FlatList
              data={userData.relatives.filter((r) => r.status == 'CONNECTED')}
              keyExtractor={(item) => item.toUser}
              renderItem={({item}) => (
                <Card
                  onPress={() =>
                    navigation.navigate('HomeProfile', {userId: item.toUser})
                  }>
                  <UserInfo>
                    <UserImgWrapper>
                      <UserImg
                        source={
                          item.toUserImg
                            ? item.toUserImg
                            : require('../assets/avatar.png')
                        }
                      />
                    </UserImgWrapper>
                    <TextSection>
                      <UserInfoText>
                        <UserName>{item.toUserName}</UserName>
                        <PostTime>{item.relationName}</PostTime>
                      </UserInfoText>
                          <Text>
                        
                          متصلون
                          -
                           {moment(item.requestDate.toDate()).fromNow()}
                          </Text>
                     </TextSection>
                  </UserInfo>
                </Card>
              )}
            />
          </React.Fragment>
        )}
      </Center>
    </NativeBaseProvider>
  );
};

export default FamilyScreen;
