import React, {useState, isPassword, setHidePassword, hidePassword} from 'react'
import { StatusBar } from 'expo-status-bar';
import{ Formik } from 'formik';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import {Octicons, Ionicons, Fontisto } from '@expo/vector-icons';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import axios from 'axios';

import * as Google from 'expo-google-app-auth';
import{
    StyledContainer,
    InnerContainer,
    PageLogo,
    PageTitle,
    SubTitle,
    StyledFormArea,
    StyledTextInput,
    StyledInputLabel,
    StyledButton,
    StyledButtontext,
    LeftIcon,
    RightIcon,
    Colors,
    ButtonText,
    MsgBox,
    Line,
    ExtraText,
    ExtraView,
    TextLink,
    TextLinkContent,

    


} from '../components/style';
const {brand, darklight, primary} = Colors;


const Login = ({navigation}) => {
    const [hidePassword, setHidePassword] = useState(true);
    const [message, setMessage] = useState();
    const [messageType, setMessageType] = useState();
    const [googleSubmitting, setGoogleSubmitting] = useState(false);
    const handleLogin = (credentials, setSubmitting) => {
        handleMessage(null);
        const url = 'http://192.168.1.133:3000/user/login';
        axios
        .post(url, credentials)
        .then((response) => {
            const result = response.data;
            
            const {message, status, data} = result;
            if (status !== 'SUCCESS') {
                handleMessage(message, status);
            }
            else {
                
                navigation.navigate("Welcome", { userData: data });


            }
            setSubmitting(false);
        }).catch(err => {
            console.error(err);
            setSubmitting(false);
            handleMessage("An error occurred. Check your network and try again.");
        });
    }
    const handleMessage = (message, type= 'FAILED') => {
        setMessage(message);
        setMessageType(type);
    }
    const handleGoogleSignin = () => {
        setGoogleSubmitting(true);
        const config = {iosClientId: '375549612210-1qjdksd91psov0nf1gk6a5lv806oh6r6.apps.googleusercontent.com',
        androidClientId:'375549612210-n2k0bn49q19ubluoqu8lcv6l1r9703k9.apps.googleusercontent.com',
        scopes: ['profile', 'email','https://www.googleapis.com/auth/youtube','https://www.googleapis.com/auth/youtube.readonly']};
        Google.logInAsync(config)
        .then(result => {
            const {type, user} = result;
            if (type == 'success') {
                const {email, name, photoUrl} = user;
                handleMessage('Google signin successful', 'SUCCESS');
                setTimeout(() => navigation.navigate("Welcome", {email, name, photoUrl}, 1000));
            }
            else {
                handleMessage('Google signin was cancelled');
            }
            setGoogleSubmitting(false);
        }).catch(error => {
            console.log(error);
            handleMessage('An error occurred. Check your network and try again.');
            setGoogleSubmitting(false);
        });
    }
    return(
        <KeyboardAvoidingWrapper>
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/img/image1.png')} />
                <PageTitle>Music Roulette</PageTitle>
                <SubTitle>Account Login</SubTitle>
                <Formik
                    initialValues={{email: '', password: ''}}
                    onSubmit={(values, {setSubmitting}) => {
                        if (values.email == '' || values.password == '') {
                            handleMessage("Please fill in all fields");
                            setSubmitting(false);
                        } else {
                            handleLogin(values, setSubmitting);
                        }
                        
                    }}>
                    {({handleChange, handleBlur, handleSubmit, values, isSubmitting}) => (<StyledFormArea> 
                        <MyTextInput
                            label="Email Address"
                            icon="mail"
                            placeholder="domain@something.com"
                            placeholderTextColor={darklight}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            keyboardType="email-address"
                            
                            />
                            <MyTextInput
                            label="Password"
                            icon="lock"
                            placeholder="* * * * * * * *"
                            
                            placeholderTextColor={darklight}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            secureTextEntry={hidePassword}
                            isPassword={true}
                            hidePassword={hidePassword}
                            setHidePassword={setHidePassword}
                            />
                            <MsgBox type={messageType}>{message}</MsgBox>

                            {!isSubmitting && <StyledButton onPress={handleSubmit}>
                                <ButtonText> 
                                    Login
                                </ButtonText>
                            </StyledButton>}
                            {isSubmitting && <StyledButton disabled={true}>
                                <ActivityIndicator size ="large" color={primary}/>
                            </StyledButton>}
                            <Line />

                            {!googleSubmitting && (
                            <StyledButton google={true} onPress={handleGoogleSignin}>
                            <Fontisto name="google" color={primary} size={25} />
                            <ButtonText google={true}> 
                                 Sign in with Google
                            </ButtonText>
                            </StyledButton>
                            )}
                            {googleSubmitting && (
                            <StyledButton google={true} disabled={true}>
                            <ActivityIndicator size ="large" color={primary} />
                            </StyledButton>
                           )}
                            <ExtraView>
                                
                                <ExtraText>Don't have an account already? </ExtraText>
                                <TextLink onPress={() => navigation.navigate("Signup")}>
                                    <TextLinkContent>Signup</TextLinkContent>
                                </TextLink>
                            </ExtraView>

                    </StyledFormArea>



                )}

                        
                    
                </Formik>
            </InnerContainer>
        </StyledContainer>
        </KeyboardAvoidingWrapper>
    );
}
const MyTextInput = ({label, icon,isPassword, hidePassword, setHidePassword, ...props}) => {
    return(
        <View>
            <LeftIcon>
                <Octicons name={icon} size={30} color={Colors.darklight} />
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledTextInput {...props} />
            {isPassword==true && (
                <RightIcon onPress={() => setHidePassword(!hidePassword)}>
                   <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={darklight} />
                </RightIcon>
            )}
        </View>
    );
};
export default Login;