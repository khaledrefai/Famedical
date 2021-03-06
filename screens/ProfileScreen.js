import React, {useState, useEffect, useContext,forceUpdate} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider';

import firestore from '@react-native-firebase/firestore';
import PostCard from '../components/PostCard';
import DropDownPicker from 'react-native-dropdown-picker';
import RadioGroup from 'react-native-radio-buttons-group';
import {Radio, Center, NativeBaseProvider} from 'native-base';
import {
  CheckIcon,
  Button,
  Flex,
  Heading,
  VStack,
  Divider,
  Spacer,
  ScrollView,
  Select,
} from 'native-base';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from 'styled-components';
import styles from '../styles/Common'

const ProfileScreen = ({navigation, route}) => {
  const {user, logout} = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [userData, setUserData] = useState(null); //login user or viewed user

  const [userID, setUserID] = useState(
    route.params ? route.params.userId : user.uid,
  );
 
  const [relations, setRelations] = useState([]);
  const [relationOption, setRelationOption] = useState(null);
  const [relativeStatus, setRelativeStatus] = useState("NOT_FOUND");
  const [userRelatives, setUserRelatives] = useState([]);
  const [loginUserData, setLoginUserData] = useState(null);

 

  useEffect(() => {
    console.log('userID-------------', userID);
    console.log('user.id-------------', user.uid);
if(userID != user.uid){
    getLoginUserData();
    fetchRelation(); 

}  
getUser();
fetchPosts();
 navigation.addListener('focus', () => setLoading(!loading));
   }, [navigation, loading,relativeStatus]);
 
  const fetchRelation = async () => {
    try {
      const list = [];
      await firestore()
        .collection('relations')
        .get()
        .then((querySnapshot) => {
          // console.log('Total Posts: ', querySnapshot.size);
          querySnapshot.forEach((doc) => {
            const {id, name_ar, name_ar_rev} = doc.data();
            list.push({
              key: doc.id,
              value: doc.id,
              label: name_ar,
              labelrev: name_ar_rev,
            });
          });
        });

      if (loading) {
        setLoading(false);
      }
      setRelations(list);
      console.log('setRelations: ', list);
    } catch (e) {
      console.log(e);
    }
  };

  const saveFamilyMember = () => {
  console.log("lgin user --------- ",loginUserData)
     //add relative request for user we viewing
    userData.relatives.push({
      toUser: user.uid,
      toUserName : loginUserData.fname + " "+ loginUserData.lname, 
      toUserImg : loginUserData.userImg,
      relationId: relationOption,
      relationName: relations.filter( x  =>  
        x.key == relationOption 
      )[0].labelrev,
      requestDate: new Date(),
      status: "PENDING", //pending
    });
    updateRelStatus();
    console.log('saveFamilyMember ---- 89');
    firestore()
      .collection('users')
      .doc(userID)
      .update({
        relatives: userData.relatives,
      })
      .then(() => {
        setUserData(userData);
        console.log('User relatives Updated!');
      });

    //add relative request for current user - loged in
    userRelatives.push({
      toUser: userID,
      toUserName : userData.fname + " "+ userData.lname, 
      toUserImg : userData.userImg,
      relationId: relationOption,
      relationName: relations.filter( x =>
        x.key == relationOption
      )[0].label,
      requestDate: new Date(),
      status: "REQ_SENT",//pending
    });

    firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        relatives: userRelatives,
      })
      .then(() => {
       setUserRelatives(userRelatives);
        console.log('logined in user relatives Updated!');
      });
  };

  const fetchPosts = async () => {
    try {
      const list = [];

      await firestore()
        .collection('posts')
        .where('userId', '==', route.params ? route.params.userId : user.uid)
        .orderBy('postTime', 'desc')
        .get()
        .then((querySnapshot) => {
          // console.log('Total Posts: ', querySnapshot.size);
          querySnapshot.forEach((doc) => {
            const {
              userId,
              diagnosis,
              postImg,
              postTime,
              diagnosisDate,
            } = doc.data();
            list.push({
              id: doc.id,
              userId,
              userName: '???? ???????? ????????????',
              userImg:
              require('../assets/avatar.png'),
              postTime: postTime,
              diagnosis,
              postImg,
              diagnosisDate: diagnosisDate,
            });
          });
        });

      setPosts(list);

      if (loading) {
        setLoading(false);
      }

      console.log('Posts: ', posts);
    } catch (e) {
      console.log(e);
    }
  };

  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(route.params ? route.params.userId : user.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          console.log('User Data', documentSnapshot.data());
          setUserData(documentSnapshot.data());
          //  setRelatives(documentSnapshot.data().relatives);
        }
      });
  };
  const getLoginUserData = async () => {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          setLoginUserData(documentSnapshot.data());
          console.log('getLoginUserData Data', documentSnapshot.data());
          updateRelStatus();
          let relat = documentSnapshot.data().relatives.filter(
            (x) => x.toUser == userID,
          )[0].status;
          console.log('relat  219 ', relat);
          if (relat == null) {
            setRelativeStatus("NOT_FOUND");
          } else {
            setRelativeStatus(relat);
          }
        }
      });
  };
  const updateRelStatus = () => {
    console.log('update start');
    try {
      if (loginUserData) {
        console.log('user have relatives', loginUserData.relatives);
        console.log('  userData.id', userID);
        let relat = loginUserData.relatives.filter(
          (x) => x.toUser == userID,
        )[0].status;
        console.log('relat   ', relat);
        if (relat == null) {
          setRelativeStatus("NOT_FOUND");
        } else {
          setRelativeStatus(relat);
        }
      }
    } catch (er) {
      console.log('update status error ', er);
    }
   };
 

  const handleDelete = () => {};

  
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
       setUserRelatives(userRelatives);
 
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
        setRelativeStatus("NOT_FOUND");
        console.log('my User relatives deleted!');
      });
        
  }

  return (
    <NativeBaseProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
    
      {loading || userData == null ? (
          <Center flex={1} px="3">
          <Image source={require('../assets/loading.gif')} />
          </Center>
        ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}>
          <Image
            style={styles.userImg}
            source={  userData.userImg?{uri: userData.userImg }: require('../assets/avatar.png') }
          />

          <Text style={styles.userName}>
            {userData ? userData.fname || '???? ???????? ??????' : '???? ???????? ??????'}
            {userData ? userData.lname || '' : ''}
          </Text>
          {/* <Text>{route.params ? route.params.userId : user.uid}</Text> */}
          <Text style={styles.aboutUser}>
            {userData ? userData.about || '???? ???????? ??????????????' : ''}
      
           </Text>

          {userID != user.uid ? (
            relativeStatus == "NOT_FOUND" ? (
              <Flex direction="row">
                <TouchableOpacity
                  style={styles.userBtn}
                  onPress={() => saveFamilyMember()}>
                  <Text style={styles.userBtnTxt}> ?????????? ????????</Text>
                </TouchableOpacity>
                <Select
                  selectedValue={relationOption}
                  minWidth="200"
                  accessibilityLabel="???????? ?????? ??????????????"
                  placeholder="???????? ?????? ??????????????"
                  _selectedItem={{
                    bg: 'teal.600',
                    endIcon: <CheckIcon size="5" />,
                  }}
                  mt={1}
                  onValueChange={(itemValue) => setRelationOption(itemValue)}>
                    {relations && relations.length > 0 ?(
                  relations.map((relation) => (
                    <Select.Item
                      label={relation.label}
                      value={relation.value}
                    />
                  )) ) :(<Select.Item label="please wait" /> )}
                </Select>
              </Flex>
            ) : relativeStatus == "CONNECTED" ? (
              <View style={styles.userBtnWrapper}>
                <TouchableOpacity style={styles.userBtn} onPress={() =>  rejectReq(userID)}>
                  <Text style={styles.userBtnTxt}>?????? ????????</Text>
                </TouchableOpacity>
              </View>
            ) : (
               relativeStatus == "REQ_SENT" ? (
              <Text style={styles.userBtnTxt}> ?????????????? ????????????????</Text>
              ):
              relativeStatus == "PENDING" ?(
                <View style={styles.userBtnWrapper}>
                <TouchableOpacity
                  style={styles.userBtn}
                  onPress={() => acceptReq(userID)}>
                  <Text style={styles.userBtnTxt}>  ???????? ??????????  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.userBtn}
                  onPress={() => rejectReq(userID)}>
                  <Text style={styles.userBtnTxt}>     ?????? ????????  </Text>
                </TouchableOpacity>
              </View>
              ) :
              (<Text>{relativeStatus}</Text>)
            )
          ) : (
            <View style={styles.userBtnWrapper}>
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => {
                  navigation.navigate('EditProfile');
                }}>
                <Text style={styles.userBtnTxt}>??????????</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={() => logout()}>
                <Text style={styles.userBtnTxt}>????????</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{posts.length}</Text>
            <Text style={styles.userInfoSubTitle}>Posts</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>10,000</Text>
            <Text style={styles.userInfoSubTitle}>Followers</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>100</Text>
            <Text style={styles.userInfoSubTitle}>Following</Text>
          </View>
        </View> */}
          <Spacer />

          <Divider />
          <Spacer />

          {posts.map((item) => (
            <PostCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </ScrollView>
        )}
       </SafeAreaView>
    </NativeBaseProvider>
  );
};

export default ProfileScreen;
