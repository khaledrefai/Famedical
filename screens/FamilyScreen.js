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
import ActionButton from 'react-native-action-button';
import DropDownPicker from 'react-native-dropdown-picker';

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
import Icon from 'react-native-vector-icons/Ionicons';

const FamilyScreen = ({navigation}) => {
  moment.locale('ar');

  const {user, logout} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [familyReq, setFamilyReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doSearch, setDoSearch] = useState(false);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  const acceptReq = async (touser) => {
    console.log('try to accept user ', touser);
    //update to user
    await firestore()
      .collection('users')
      .doc(touser)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          let i = documentSnapshot
            .data()
            .relatives.findIndex((x) => x.toUser == user.uid);
          documentSnapshot.data().relatives[i].status = 'CONNECTED';
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

    let i = userData.relatives.findIndex((x) => x.toUser == touser);
    userData.relatives[i].status = 'CONNECTED';
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
  };
  const rejectReq = async (touser) => {
    console.log('try to del user ', touser);
    //update to user
    await firestore()
      .collection('users')
      .doc(touser)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          let i = documentSnapshot
            .data()
            .relatives.findIndex((x) => x.toUser == user.uid);
          documentSnapshot.data().relatives.splice(i, 1);
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

    let i = userData.relatives.findIndex((x) => x.toUser == touser);
    userData.relatives.splice(i, 1);
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
  };
  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          console.log('User Data', documentSnapshot.data());
          setUserData(documentSnapshot.data());
          
          // console.log(
          //   'User relaive ',
          //   documentSnapshot
          //     .data().relatives.filter((r) => r.status != 'PEDING'),
          // );

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
        userData.relatives?(
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
                            <Text style={styles.userBtnTxt}> قبول الطلب </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.userBtn}
                            onPress={() => rejectReq(item.toUser)}>
                            <Text style={styles.userBtnTxt}> رفض وحذف </Text>
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
                        <Text>
                          
                          تم ارسال الطلب 
                          {' '}
                          {moment(item.requestDate.toDate()).fromNow()}
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
                        متصلون {' '}{moment(item.requestDate.toDate()).fromNow()}
                      </Text>
                    </TextSection>
                  </UserInfo>
                </Card>
              )}
            />
          </React.Fragment>
          ):(<></>)
       
       )}
        {open ? (
          <DropDownPicker
            searchPlaceholder="ابحث باستخدام الاسم ,الايميل او رقم الهاتف"
            open={open}
            value={value}
            items={items}
            listMode="MODAL"
            searchable={true}
            disableLocalSearch={true}
            setOpen={setOpen}
            onClose={() => {setItems([]) ;
            setOpen(false);
            setValue(null);
            }}
            customItemContainerStyle={{
              height : 52
            }}
             setValue={setValue}
            setItems={setItems}
            onChangeValue={(value) => {
              console.log('value onChangeValue ----------',value);
              if(value)
              navigation.navigate('HomeProfile',{
                userId: value
            });
            }}
            onChangeSearchText={(text) => {
              // Show the loading animation
              setLoading(true);
              try {
                const list = [];
                firestore()
                  .collection('users')
                  .where('keywords', 'array-contains', text)
                  //.where('id','!=',user.uid)
                  .limit(20)
                  .get()
                  .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                      const {fname, lname, userImg} = doc.data();

                      list.push({
                        value: doc.id,
                        label: fname + ' ' + lname,
                        icon: () => (
                          <Image
                            source={
                              userImg?{uri: userImg }
                                : require('../assets/avatar.png')
                            }
                            style={styles.userIcon}
                          />
                        ),
                      });
                      console.log('result  in search -->', list);
                      setItems(list);
                    });
                  });
              } catch (error) {
                console.log('error in search -->', error);
              } finally {
                setLoading(false);
              }
            }}
          />
        ) : (
          <></>
        )}
      </Center>
      <ActionButton
        buttonColor="#78aa37"
        renderIcon={(active) => (
          <Icon name="search" style={styles.actionButtonIcon} />
        )}
        onPress={() => {
          setOpen(true);
        }}
      />
    </NativeBaseProvider>
  );
};

export default FamilyScreen;
