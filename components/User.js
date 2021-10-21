import React, {useContext, useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
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

import moment from 'moment';
import {TouchableOpacity} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';

const PostCard = ({ navigation, item, onRemove, onAdd, onPress}) => {
  const {user, logout} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  
  return (
    <Card key={item.id}>
      <UserInfo>
        <UserImg
          source={{
            uri: item
              ? item.userImg ||
                'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'
              : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
          }}
        />
        <UserInfoText>
          <TouchableOpacity onPress={onPress}>
            <UserName>
              {item ? item.fname || 'No Data' : 'no Data'}{' '}
              {item ? item.lname || 'No Data' : 'no Data'}
            </UserName>
          </TouchableOpacity>
          <PostTime>{item.country} {item.city}</PostTime>
        </UserInfoText>
      </UserInfo>
      <PostText>  {item.about} </PostText>
      
   {item.id in user.friends ? (
      <InteractionWrapper>
         <Interaction onPress={() => onDelete(item.id)}>
            <Ionicons name="person-remove-outline" size={25} />
            <InteractionText>حذف</InteractionText>
          </Interaction>
     
      </InteractionWrapper>
         ) :  <InteractionWrapper>
         <Interaction   onPress={() => {
                   navigation.navigate('AddPost',{
                     paramKey: item,
                   });
                 }}>
           <Ionicons name="person-add-outline" size={25} color="#333" />
           <InteractionText>اضافة قريب</InteractionText>
         </Interaction>
        
      
           <Interaction onPress={() => onDelete(item.id)}>
             <Ionicons name="md-trash-bin" size={25} />
             <InteractionText>حذف</InteractionText>
           </Interaction>
      
       </InteractionWrapper>}
    </Card>
  );
};

export default PostCard;
