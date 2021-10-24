import React, {useState, useContext , useEffect} from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,Dimensions,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
 

import {
  InputField,
  InputWrapper,
  AddImage,
  SubmitBtn,
  SubmitBtnText,
  StatusWrapper,
} from '../styles/AddPost';

import { AuthContext } from '../navigation/AuthProvider';
import DatePicker from 'react-native-date-picker'

const AddPostScreen = ({navigation,route,state}) => {

  let postParam= null;
  try{
      postParam=  route.params.paramKey ;
    console.log(postParam);
  }catch(er){
    console.log(er);
  }
  const {user, logout} = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const [image, setImage] = useState(postParam?postParam.postImg:null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [post, setPost] = useState(postParam);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
   const [date, setDate] = useState(postParam?new Date( postParam.diagnosisDate.toDate()): new Date());
  const [diagnosis, setDiagnosis] = useState(postParam?postParam.diagnosis:null);
  const [disease , setDisease]= useState(postParam?postParam.diagnosis.value:null);
 //console.log("post",post);

 /* const getPost = async() => {
    await firestore()
    .collection('posts')
    .doc( postId)
    .get()
    .then((documentSnapshot) => {
      if( documentSnapshot.exists ) {
        console.log('doc  Data-------------',documentSnapshot.data());
           setPost(documentSnapshot.data());
         
        console.log('post  Data-------------',post);
           setImage(documentSnapshot.data().postImg);
           setDiagnosis(diseases[documentSnapshot.data().diagnosisId]);
          setDate( new Date(documentSnapshot.data().diagnosisDate.toDate()));
   
       
       }else{
         console.log("no post >>>>>")
       }
    })
  }*/
  
 

  const fetchDiseases = async () => {
    try {
   const list = [];
         setLoading(true);
       await firestore()
        .collection('disease')
        .get()
        .then((querySnapshot) => {
     console.log('Total Posts: ', querySnapshot.size);

          querySnapshot.forEach((doc) => {
            const {
              name_ar,
              name_en, 
            } = doc.data();

            list.push({
              value : doc.id,
              label : name_ar +' - ' +name_en,
                
            });

 
          });
        });

   setDiseases(list);
 
      console.log('Disease : ',  diseases );
     } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetchDiseases();
  },[]);
  useEffect(() => {
    setLoading(true)
    setPost(postParam);
     navigation.addListener("focus", () => setLoading(!loading));
   },[navigation]);

 const updateDiagnosisLabel = (value) =>{
   try{
    console.log( "  121 ----- value " + value);
    console.log( "  122 ----- ffff " + diseases.find(x=> x.value== value).label);

   setDiagnosis(diseases.find(x=> x.value== value));
  console.log( "  124 ----- diagnose " + diagnosis.label);
   }catch(e){

   }
 }

 
 
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const submitPost = async () => {
    const imageUrl = await uploadImage();
    console.log('Image Url: ', imageUrl);
    console.log('Post: ', post);
    console.log("diagnosis",diagnosis.label);
    firestore()
    .collection('posts')
    .doc(post?post.id:null)
    .set({
      userId: user.uid,
      diagnosis: diagnosis,
      postImg: imageUrl?imageUrl:post?post.postImg:null,
      postTime: firestore.Timestamp.fromDate(new Date()),
      diagnosisDate : date,
      },{merge : true})
    .then(() => {
      console.log('Post Added!');
      Alert.alert(
         'تم الحفظ',
      );
      navigation.navigate('HomeScreen');
    })
    .catch((error) => {
      console.log('Something went wrong with added post to firestore.', error);
    });
  }

  const uploadImage = async () => {
    if( image == null ) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop(); 
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);

      // Alert.alert(
      //   'Image uploaded!',
      //   'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
      // );
      return url;

    } catch (e) {
      console.log(e);
      return null;
    }

  };

  return (
    <View style={styles.container}>
<Text style={styles.lable}>
  تاريخ التشخيص
  </Text>
  <DatePicker date={ date} onDateChange={setDate} mode="date"/>
  <Text style={styles.lable}> 
  التشخيص
  </Text >
  <DropDownPicker
   loading={loading}
  placeholder="الرجاء اختيار التشخيص"
  searchPlaceholder="اكتب هنا للبحث"
  listMode="MODAL"
  zIndex={50}
   open={open}
      value={disease}
      items={diseases}
      setOpen={setOpen}
      setValue={setDisease}
      setItems={setDiseases}
      searchable={true}
onChangeValue={(value) => {
  updateDiagnosisLabel(value);
}}  />
            <View style={{width: 700, height: 250 ,marginTop:5 , marginBottom : 5}} >
        {image != null ? <AddImage source={{uri: image}} />:null     }
         </View>
        {uploading ? (
          <StatusWrapper>
            <Text>{transferred} % Completed!</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </StatusWrapper>
        ) : (
          <SubmitBtn onPress={submitPost}>
            <SubmitBtnText>حفظ</SubmitBtnText>
          </SubmitBtn>
        )}
 
      <ActionButton buttonColor="#2e64e5"  zIndex={2000} >
        <ActionButton.Item
          buttonColor="#9b59b6"
          title="تصوير من الكميرا"
          onPress={takePhotoFromCamera}>
          <Icon name="camera-outline" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="#3498db"
          title="اختر من المكتبة"
          onPress={choosePhotoFromLibrary}>
          <Icon name="md-images-outline" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
    </View>
  );
};

export default AddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
    zIndex:200,
  },
  lable: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
});
