import React, {useContext, useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {RelationName,
  Container,
  Card,
  UserInfo,
  UserImg,
  UserName,
  UserInfoText,
  PostTime,
  PostText,
  PostImg,
  InteractionWrapper,
  Interaction,
  InteractionText,
  Divider,
} from '../styles/FeedStyles';

import ProgressiveImage from './ProgressiveImage';

import {AuthContext} from '../navigation/AuthProvider';

import moment from 'moment/min/moment-with-locales';
import {TouchableOpacity} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';

const PostCard = ({ navigation, item, onDelete, relationName}) => {
  moment.locale('ar');

  const {user, logout} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
 
  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(item.userId)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          console.log('User Data', documentSnapshot.data());
          setUserData(documentSnapshot.data());
        }
      });
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <Card key={item.id}>
      <UserInfo>
        <UserImg
          source={{
            uri: userData
              ? userData.userImg ||
                'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'
              : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
          }}
        />
         
        <UserInfoText>
          <TouchableOpacity   onPress={() => {
                  navigation.navigate('HomeProfile',{
                      userId: item.userId 
                  });
                }}>
            <UserName>
              {userData ? userData.fname || 'No Data' : 'no Data'}{' '}
              {userData ? userData.lname || 'No Data' : 'no Data'}
            </UserName>
          </TouchableOpacity>
         
          <RelationName>{relationName}</RelationName>
        </UserInfoText>
       
      </UserInfo>
      <PostText>  {item.diagnosis.label}     {' '}
      <PostTime>{moment(item.diagnosisDate.toDate()).fromNow()}</PostTime>
      </PostText>
       {/* {item.postImg != null ? <PostImg source={{uri: item.postImg}} /> : <Divider />} */}
      {item.postImg != null ? (
        <ProgressiveImage
          defaultImageSource={require('../assets/default-img.jpg')}
          source={{uri: item.postImg}}
          style={{width: '100%', height: 250}}
          resizeMode="cover"
        />
      ) : (
        <Divider />
      )}
   {user.uid == item.userId ? (
      <InteractionWrapper>
        <Interaction   onPress={() => {
                  navigation.navigate('AddPost',{
                    paramKey: item,
                    
                  });
                }}>
          <Ionicons name="create-outline" size={25} color="#333" />
          <InteractionText>تعديل</InteractionText>
        </Interaction>
       
     
          <Interaction onPress={() => onDelete(item.id)}>
            <Ionicons name="md-trash-bin" size={25} />
            <InteractionText>حذف</InteractionText>
          </Interaction>
     
      </InteractionWrapper>
         ) : null}
    </Card>
  );
};

export default PostCard;
