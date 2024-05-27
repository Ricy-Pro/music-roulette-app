import React, {useState, isPassword, setHidePassword, hidePassword} from 'react'
import { StatusBar } from 'expo-status-bar';
import{ Formik } from 'formik';
import { View, Text, Image , TouchableOpacity, ActivityIndicator} from 'react-native';
import {Octicons, Ionicons, Fontisto } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import axios from 'axios';
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


const Signup = ({navigation}) => {
    const [hidePassword, setHidePassword] = useState(true);
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(new Date(2000, 0, 1));
    const [dob,setDob] = useState();
    const [message, setMessage] = useState();
    const [messageType, setMessageType] = useState();
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
        setDob(currentDate);
    }
    const showDatePicker = () => {
        setShow(true);
    }

    const handleSignup = (credentials, setSubmitting) => {
        handleMessage(null);
        const url = 'http://192.168.1.8:3000/user/signup';
        axios
        .post(url, credentials)
        .then((response) => {
            const result = response.data;
            const {message, status, data} = result;
            if (status !== 'SUCCESS') {
                handleMessage(message, status);
            }
            else {
                navigation.navigate("Login");
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
    return(
        <KeyboardAvoidingWrapper>
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer> 
                <PageTitle>Music Roulette</PageTitle>
                <SubTitle>Account Signup</SubTitle>
                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode='date'
                        is24Hour={true}
                        display="default"
                        onChange={onChange}
                    />
                
                )}
                <Formik
                    initialValues={{name: '',email: '',dateOfBirth:'', password: '',confirmPassword: ''}}
                    
                    onSubmit={(values, {setSubmitting} ) => {
                        values= {...values, dateOfBirth: dob};
                        if (values.email == '' || values.password == '' || values.name == '' || values.dateOfBirth == '' || values.confirmPassword == '') {
                            handleMessage("Please fill in all fields");
                            setSubmitting(false);
                        } else if (values.password !== values.confirmPassword) {
                            handleMessage("Passwords must match");
                            setSubmitting(false);
                        }
                        else {
                            handleSignup(values, setSubmitting);
                        }
                    }}>
                    {({handleChange, handleBlur, handleSubmit, values, isSubmitting}) => (<StyledFormArea> 
                        <MyTextInput
                            label="Username"
                            icon="person"
                            placeholder="username"
                            placeholderTextColor={darklight}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            value={values.username}
                            
                            
                            />
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
                            label="Date of Birth"
                            icon="calendar"
                            placeholder="YYYY - MM - DD"
                            placeholderTextColor={darklight}
                            onChangeText={handleChange('dateOfBirth')}
                            onBlur={handleBlur('dateOfBirth')}
                            value={dob ? dob.toDateString() : ''}
                            isDate={true}
                            editable={false}
                            showDatePicker={showDatePicker}
                             
                            
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
                            <MyTextInput
                            label="Confirm Password"
                            icon="lock"
                            placeholder="* * * * * * * *"
                            
                            placeholderTextColor={darklight}
                            onChangeText={handleChange('confirmPassword')}
                            onBlur={handleBlur('confirmPassword')}
                            value={values.confirmPassword}
                            secureTextEntry={hidePassword}
                            isPassword={true}
                            hidePassword={hidePassword}
                            setHidePassword={setHidePassword}
                            />
                            <MsgBox type={messageType}>{message}</MsgBox>

                            {!isSubmitting && <StyledButton onPress={handleSubmit}>
                                <ButtonText> 
                                    Signup
                                </ButtonText>
                            </StyledButton>}
                            {isSubmitting && <StyledButton disabled={true}>
                                <ActivityIndicator size ="large" color={primary}/>
                            </StyledButton>}
                            <Line />


                            <ExtraView>
                                <ExtraText>Already have an account? </ExtraText>
                                <TextLink onPress={()=> navigation.navigate("Login")}>
                                    <TextLinkContent>Login</TextLinkContent>
                                </TextLink>
                            </ExtraView>

                    </StyledFormArea>)}

                        
                    
                </Formik>
            </InnerContainer>
        </StyledContainer>
        </KeyboardAvoidingWrapper>
    );
}
const MyTextInput = ({label, icon,isPassword, hidePassword, setHidePassword,isDate, showDatePicker, ...props}) => {
    return(
        <View>
            <LeftIcon>
                <Octicons name={icon} size={30} color={Colors.darklight} />
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            {!isDate && <StyledTextInput {...props} />}
            {isDate && (
                <TouchableOpacity onPress={showDatePicker}>
                    <StyledTextInput {...props} />
                </TouchableOpacity>
            )}
            {isPassword==true && (
                <RightIcon onPress={() => setHidePassword(!hidePassword)}>
                   <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={darklight} />
                </RightIcon>
            )}
        </View>
    );
};
export default Signup; 