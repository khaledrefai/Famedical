import React, {useState, useEffect, useContext} from 'react';
import {   ScrollView,  SafeAreaView,Image,
  View,   Button, StyleSheet } from 'react-native';
 
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
} from "native-base"
const Messages = [
  {
    id: '1',
    userName: 'Jenny Doe',
    userImg: require('../assets/users/user-3.jpg'),
    messageTime: '4 mins ago',
    messageText:
      'Hey there, this is my test for a post of my social app in React Native.',
  },
  {
    id: '2',
    userName: 'John Doe',
    userImg: require('../assets/users/user-1.jpg'),
    messageTime: '2 hours ago',
    messageText:
      'Hey there, this is my test for a post of my social app in React Native.',
  },
  {
    id: '3',
    userName: 'Ken William',
    userImg: require('../assets/users/user-4.jpg'),
    messageTime: '1 hours ago',
    messageText:
      'Hey there, this is my test for a post of my social app in React Native.',
  },
  {
    id: '4',
    userName: 'Selina Paul',
    userImg: require('../assets/users/user-6.jpg'),
    messageTime: '1 day ago',
    messageText:
      'Hey there, this is my test for a post of my social app in React Native.',
  },
  {
    id: '5',
    userName: 'Christy Alex',
    userImg: require('../assets/users/user-7.jpg'),
    messageTime: '2 days ago',
    messageText:
      'Hey there, this is my test for a post of my social app in React Native.',
  },
];

const FamilyScreen = ({navigation, route}) => {

    const {user, logout} = useContext(AuthContext);
    const[userData,setUserData] = useState(null);
    const[familyReq,setFamilyReq] = useState(null);
    const [loading, setLoading] = useState(true);
    const getUser = async() => {
        await firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then((documentSnapshot) => {
          if( documentSnapshot.exists ) {
            console.log('User Data', documentSnapshot.data());
            setUserData(documentSnapshot.data());
            console.log('User relaive ',  documentSnapshot.data().relatives.filter( r => r.status != "PEDING")  );
           
            if (loading) {
              setLoading(false);
            }
          }
        })
      }


      useEffect(() => {
        getUser(); 
        
        navigation.addListener('focus', () => setLoading(!loading));
      }, [navigation, loading]);

    return (
      <NativeBaseProvider>
      <Center flex="1" >
       <Container>
      { loading ||  userData==null ? (
       <Image
       source={require('../assets/loading.gif')}
      />
      ):(
        <React.Fragment>
 
        <FlatList 
          data={userData.relatives.filter( r => r.status == "PENDING")  }
          keyExtractor={item=>item.toUser}
          renderItem={({item}) => (
            <Card onPress={() => navigation.navigate('HomeProfile', {   userId: item.toUser })}>
              <UserInfo>
                <UserImgWrapper>
                  <UserImg source={item.toUserImg?item.toUserImg :require('../assets/avatar.jpg')} />
                </UserImgWrapper>
                <TextSection>
                  <UserInfoText>
                    <UserName>{item.toUserName}</UserName>
                    <PostTime>{item.relationName}</PostTime>
                  </UserInfoText>
                  <MessageText></MessageText>
                </TextSection>
              </UserInfo>
            </Card>
          )}
        />
        </React.Fragment>
        )}
      </Container> 
      </Center>
      </NativeBaseProvider>
    );
};

export default FamilyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});
