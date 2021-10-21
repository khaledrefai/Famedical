import React, {useState, useEffect, useContext} from 'react';
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

const ProfileScreen = ({navigation, route}) => {
  const {user, logout} = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userID, setUserID] = useState(route.params.userId);

  const [relations, setRelations] = useState([]);
  const [relationOption, setRelationOption] = useState(null);
  const [relativeStatus, setRelativeStatus] = useState(0);
  const [userRelatives, setUserRelatives] = useState([]);
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
            });
          });
        });

      if (loading) {
        setLoading(false);
      }
      setRelations(list);
      console.log('setRelations: ', relations);
    } catch (e) {
      console.log(e);
    }
  };

  const saveFamilyMember = () => {
    console.log('saveFamilyMember ---- 81');
    userData.relatives.push({
      toUser: route.params.userId,
      relationId: relationOption,
      requestDate: new Date(),
      status: 1,
    });
    updateRelStatus();
    console.log('saveFamilyMember ---- 89');
    firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        relatives: userData.relatives,
      })
      .then(() => {
        console.log('User Updated!');
        Alert.alert(
          'Profile Updated!',
          'Your profile has been updated successfully.',
        );
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
              userName: 'Test Name',
              userImg:
                'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
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
          console.log('User Data',  documentSnapshot.data());
          setUserData( documentSnapshot.data());
          //  setRelatives(documentSnapshot.data().relatives);
        }
      });
  };
  const getUserRelatives = async () => {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          if(documentSnapshot.data().relatives){
          console.log('User relatives', documentSnapshot.data().relatives);
          setUserRelatives(documentSnapshot.data().relatives);
          let relat = documentSnapshot.data().relatives.find((x) => x.toUser.toString() == userID.toString());
          console.log('relat   2222222', relat);
          if (relat == null) {
            setRelativeStatus(0);
          } else {
            setRelativeStatus(relat);
          }  

          }
          //  setRelatives(documentSnapshot.data().relatives);
        }
      });
  };
  const updateRelStatus = () => {
    console.log('update start');
    try {
      if (userRelatives) {
        console.log('user have relatives' , userRelatives);
        console.log('  userData.id' , userID);
        let relat = userRelatives.find((x) => x.toUser.toString() == userID.toString());
        console.log('relat   ', relat);
        if (relat == null) {
          setRelativeStatus(0);
        } else {
          setRelativeStatus(relat);
        }
      }
    } catch (er) {
      console.log('update status error ', er);
    }
  };
  useEffect(() => {
    getUser();
    getUserRelatives();
    fetchPosts();
    fetchRelation();

    navigation.addListener('focus', () => setLoading(!loading));
  }, [navigation, loading]);

  const handleDelete = () => {};

  return (
    <NativeBaseProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}>
          <Image
            style={styles.userImg}
            source={{
              uri: userData
                ? userData.userImg ||
                  'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'
                : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
            }}
          />

          <Text style={styles.userName}>
            {userData ? userData.fname || 'Test' : 'Test'}
            {userData ? userData.lname || 'User' : 'User'}
          </Text>
          {/* <Text>{route.params ? route.params.userId : user.uid}</Text> */}
          <Text style={styles.aboutUser}>
            {userData ? userData.about || 'No details added.' : ''}
          </Text>
          <Divider />

          {route.params ? (
            relativeStatus == 0 ? (
              <Flex direction="row">
                <TouchableOpacity
                  style={styles.userBtn}
                  onPress={() => saveFamilyMember()}>
                  <Text style={styles.userBtnTxt}> اضافة قريب</Text>
                </TouchableOpacity>
                <Select
                  selectedValue={relationOption}
                  minWidth="200"
                  accessibilityLabel="اختر صله القرابة"
                  placeholder="اختر صلة القرابة"
                  _selectedItem={{
                    bg: 'teal.600',
                    endIcon: <CheckIcon size="5" />,
                  }}
                  mt={1}
                  onValueChange={(itemValue) => setRelationOption(itemValue)}>
                  {relations.map((relation) => (
                    <Select.Item
                      label={relation.label}
                      value={relation.value}
                    />
                  ))}
                </Select>
              </Flex>
            ) : relativeStatus == 2 ? (
              <View style={styles.userBtnWrapper}>
                <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                  <Text style={styles.userBtnTxt}>حذف قريب</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /*pendig*/
              <Text style={styles.userBtnTxt}> بانتظار الموافقة</Text>
            )
          ) : (
            <View style={styles.userBtnWrapper}>
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => {
                  navigation.navigate('EditProfile');
                }}>
                <Text style={styles.userBtnTxt}>تعديل</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={() => logout()}>
                <Text style={styles.userBtnTxt}>خروج</Text>
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
      </SafeAreaView>
    </NativeBaseProvider>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  myradio: {},
});