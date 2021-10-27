import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

import Onboarding from 'react-native-onboarding-swiper';

const Dots = ({selected}) => {
    let backgroundColor;

    backgroundColor = selected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)';

    return (
        <View 
            style={{
                width:6,
                height: 6,
                marginHorizontal: 3,
                backgroundColor
            }}
        />
    );
}

const Skip = ({...props}) => (
    <TouchableOpacity
        style={{marginHorizontal:10}}
        {...props}
    >
        <Text style={{fontSize:16}}>تخطي</Text>
    </TouchableOpacity>
);

const Next = ({...props}) => (
    <TouchableOpacity
        style={{marginHorizontal:10}}
        {...props}
    >
        <Text style={{fontSize:16}}>التالي</Text>
    </TouchableOpacity>
);

const Done = ({...props}) => (
    <TouchableOpacity
        style={{marginHorizontal:10}}
        {...props}
    >
        <Text style={{fontSize:16}}>تم</Text>
    </TouchableOpacity>
);

const OnboardingScreen = ({navigation}) => {
    return (
        <Onboarding
        SkipButtonComponent={Skip}
        NextButtonComponent={Next}
        DoneButtonComponent={Done}
        DotComponent={Dots}
        onSkip={() => navigation.replace("Login")}
        onDone={() => navigation.navigate("Login")}
        pages={[
          {
            backgroundColor: '#a6e4d0',
            image: <Image source={require('../assets/onboarding-img1-n.png')} />,
            title: 'تاريخك الطبي',
            subtitle: 'قم بتسجيل كافة الامراض التي تم تشخيصك بها',
          },
          {
            backgroundColor: '#fdeb93',
            image: <Image source={require('../assets/onboarding-img2-n.png')} />,
            title: 'تواصل مع العائلة',
            subtitle: 'تواصل مع افراد العائلة حول العالم ليقومو بالتسجيل ايضا',
          },
          {
            backgroundColor: '#e9bcbe',
            image: <Image source={require('../assets/onboarding-img3-n.png')} />,
            title: 'نصائح طبية',
            subtitle: "احصل على تحذيرات للامراض التي من الممكن ان تصاب بها ونصائح لتجنب الاصابة",
          },
        ]}
      />
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});
