import React, {useEffect, useState,useContext} from 'react';
import {Image,
  View,
  ScrollView,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../navigation/AuthProvider';

import PostCard from '../components/PostCard';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

import {Container} from '../styles/FeedStyles';

const Posts = [
  {
    id: '1',
    userName: 'Jenny Doe',
    userImg: require('../assets/users/user-3.jpg'),
    postTime: '4 mins ago',
    post:
      'Hey there, this is my test for a post of my social app in React Native.',
    postImg: require('../assets/posts/post-img-3.jpg'),
    liked: true,
    likes: '14',
    comments: '5',
  },
  {
    id: '2',
    userName: 'John Doe',
    userImg: require('../assets/users/user-1.jpg'),
    postTime: '2 hours ago',
    post:
      'Hey there, this is my test for a post of my social app in React Native.',
    postImg: 'none',
    liked: false,
    likes: '8',
    comments: '0',
  },
  {
    id: '3',
    userName: 'Ken William',
    userImg: require('../assets/users/user-4.jpg'),
    postTime: '1 hours ago',
    post:
      'Hey there, this is my test for a post of my social app in React Native.',
    postImg: require('../assets/posts/post-img-2.jpg'),
    liked: true,
    likes: '1',
    comments: '0',
  },
  {
    id: '4',
    userName: 'Selina Paul',
    userImg: require('../assets/users/user-6.jpg'),
    postTime: '1 day ago',
    post:
      'Hey there, this is my test for a post of my social app in React Native.',
    postImg: require('../assets/posts/post-img-4.jpg'),
    liked: true,
    likes: '22',
    comments: '4',
  },
  {
    id: '5',
    userName: 'Christy Alex',
    userImg: require('../assets/users/user-7.jpg'),
    postTime: '2 days ago',
    post:
      'Hey there, this is my test for a post of my social app in React Native.',
    postImg: 'none',
    liked: false,
    likes: '0',
    comments: '0',
  },
];

const HomeScreen = ({navigation}) => {
  const {user, logout} = useContext(AuthContext);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPosts();
    console.log('refreshed');
    });
    return unsubscribe;
  }, [navigation]);
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const[relUserMap,setRelUserMap]= useState([]);
  const[msg,setMsg] = useState("");
  const fetchPosts = async () => {
    try {
      await firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
           console.log('getLoginUserData Data relatives', documentSnapshot.data().relatives);
           if(documentSnapshot.data().relatives){
          const relUsers =[""]
          const relUserMapl=[""]
          documentSnapshot.data().relatives.forEach((rel)=>{
            if(rel.status == "CONNECTED"){
                 relUsers.push(rel.toUser) ;
                  relUserMapl.push({toUSer : rel.toUser,relationName : rel.relationName})    
            }
          });
          setRelUserMap(relUserMapl);
          console.log('relUsers             ', relUserMapl);

          const list = [];

            firestore()
            .collection('posts')
            .where('userId','in',relUsers)
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
              setPosts(list);
    
              if (loading) {
                setLoading(false);
              }

            });
    
          }else{
            setMsg( "???? ???????????? ???? ?????????????? ???????????????? ???? ???????? ?????????? ?????? ???????? ?????????????? ???? ???????????? ");
            if (loading) {
              setLoading(false);
            }
          }
        }else{
          setMsg( "???? ???????????? ???? ?????????????? ???????????????? ???? ???????? ?????????? ?????? ???????? ?????????????? ???? ???????????? ");
          if (loading) {
            setLoading(false);
          }
        }
      });
     

      console.log('Posts: ', posts);
    } catch (e) {
      console.log(e);
    }
  };
 

  useEffect(() => {
    fetchPosts();
    setDeleted(false);
  }, [deleted]);
 
  const handleDelete = (postId) => {
    Alert.alert(
      '?????? ??????????????',
      '???? ?????? ?????????? ??',
      [
        {
          text: '??????????',
          onPress: () => console.log('Cancel Pressed!'),
          style: 'cancel',
        },
        {
          text: '??????????',
          onPress: () => deletePost(postId),
        },
      ],
      {cancelable: false},
    );
  };

  const deletePost = (postId) => {
    console.log('Current Post Id: ', postId);

    firestore()
      .collection('posts')
      .doc(postId)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          const {postImg} = documentSnapshot.data();

          if (postImg != null) {
            const storageRef = storage().refFromURL(postImg);
            const imageRef = storage().ref(storageRef.fullPath);

            imageRef
              .delete()
              .then(() => {
                console.log(`${postImg} has been deleted successfully.`);
                deleteFirestoreData(postId);
              })
              .catch((e) => {
                console.log('Error while deleting the image. ', e);
              });
            // If the post image is not available
          } else {
            deleteFirestoreData(postId);
          }
        }
      });
  };

  const deleteFirestoreData = (postId) => {
    firestore()
      .collection('posts')
      .doc(postId)
      .delete()
      .then(() => {
        Alert.alert(
           '???? ?????? ?????????????? ??????????',
        );
        setDeleted(true);
      })
      .catch((e) => console.log('Error deleting posst.', e));
  };

  const ListHeader = () => {
    return null;
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      {loading ? (
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{alignItems: 'center'}}>
          <SkeletonPlaceholder>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 60, height: 60, borderRadius: 50}} />
              <View style={{marginLeft: 20}}>
                <View style={{width: 120, height: 20, borderRadius: 4}} />
                <View
                  style={{marginTop: 6, width: 80, height: 20, borderRadius: 4}}
                />
              </View>
            </View>
            <View style={{marginTop: 10, marginBottom: 30}}>
              <View style={{width: 300, height: 20, borderRadius: 4}} />
              <View
                style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}}
              />
              <View
                style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}}
              />
            </View>
          </SkeletonPlaceholder>
          <SkeletonPlaceholder>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 60, height: 60, borderRadius: 50}} />
              <View style={{marginLeft: 20}}>
                <View style={{width: 120, height: 20, borderRadius: 4}} />
                <View
                  style={{marginTop: 6, width: 80, height: 20, borderRadius: 4}}
                />
              </View>
            </View>
            <View style={{marginTop: 10, marginBottom: 30}}>
              <View style={{width: 300, height: 20, borderRadius: 4}} />
              <View
                style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}}
              />
              <View
                style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}}
              />
            </View>
          </SkeletonPlaceholder>
        </ScrollView>
      ) : ( posts?(
        <ScrollView>
             {posts.map((item) => (
          <PostCard key={item.id} item={item} onDelete={handleDelete}  navigation={navigation} 
          relationName={relUserMap.filter((r)=> r.toUSer==item.userId)[0].relationName } 
      />
        ))}
       
        </ScrollView>
  ):(
     <Container  style={styles.container}>
    <Image
        source={require('../assets/rn-social-logo.png')}
        style={styles.logo}
      />
    <Text  style={styles.baseText}> {msg}</Text>
    </Container>
  ))}
    </SafeAreaView>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  baseText: {
    fontFamily: "Cochin",
    fontSize: 30,
    color: '#78aa37',
    textAlign :'center'
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  },
  logo: {
    height: 300,
    width: 300,
    resizeMode: 'cover',
  }
});
