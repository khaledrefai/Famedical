import React, {useContext, useState} from 'react';
import {View, Text, TouchableOpacity, Platform, StyleSheet} from 'react-native';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import SocialButton from '../components/SocialButton';
import {AuthContext} from '../navigation/AuthProvider';
import { useValidation } from 'react-native-form-validator';


const SignupScreen = ({navigation}) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();

  const {register} = useContext(AuthContext);

  const { validate, isFieldInError, getErrorsInField, getErrorMessages  } = useValidation({
    state: { email , password ,confirmPassword },
    //messages: customValidationMessages,
  });
  const _onPressButton = (email,pass) => {
    validate({
      email: { email: true },
      confirmPassword: { equalPassword: password },
    });
    if(validate){
      register(email , pass)
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create an account</Text>

      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="user"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
   {isFieldInError('email') &&
        getErrorsInField('email').map(errorMessage => (
          <Text>{errorMessage}</Text>
        ))}
      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />

      <FormInput
        labelValue={confirmPassword}
        onChangeText={(userPassword) => setConfirmPassword(userPassword)}
        placeholderText="Confirm Password"
        iconType="lock"
        secureTextEntry={true}
      />
   {isFieldInError('confirmPassword') &&
        getErrorsInField('confirmPassword').map(errorMessage => (
          <Text>{errorMessage}</Text>
        ))}
      <FormButton
        buttonTitle=" تسجيل  "
        onPress={() => _onPressButton(email, password)}
      />

      {/* <View style={styles.textPrivate}>
        <Text style={styles.color_textPrivate}>
          By registering, you confirm that you accept our{' '}
        </Text>
        <TouchableOpacity onPress={() => alert('Terms Clicked!')}>
          <Text style={[styles.color_textPrivate, {color: '#e88832'}]}>
            Terms of service
          </Text>
        </TouchableOpacity>
        <Text style={styles.color_textPrivate}> and </Text>
        <Text style={[styles.color_textPrivate, {color: '#e88832'}]}>
          Privacy Policy
        </Text>
      </View> */}

      {Platform.OS === 'android' ? (
        <View>
          {/* <SocialButton
            buttonTitle="Sign Up with Facebook"
            btnType="facebook"
            color="#4867aa"
            backgroundColor="#e6eaf4"
            onPress={() => {}}
          /> */}
    
          <SocialButton
            buttonTitle="التسجيل باسخدام جوجل"
            btnType="google"
            color="#de4d41"
            backgroundColor="#f5e7ea"
            onPress={() => {}}
          />
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.navButtonText}>هل لديك حساب ؟ قم بتسجيل الدخول</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafd',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontFamily: 'Kufam-SemiBoldItalic',
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
  },
  navButton: {
    marginTop: 15,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
    fontFamily: 'Lato-Regular',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 35,
    justifyContent: 'center',
  },
  color_textPrivate: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Lato-Regular',
    color: 'grey',
  },
  color_error: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'Lato-Regular',
    color: 'red',
  },
});
