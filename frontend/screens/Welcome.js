import React, {useState, isPassword, setHidePassword, hidePassword} from 'react'
import { StatusBar } from 'expo-status-bar';
import{ Formik } from 'formik';
import { View, Text, Image } from 'react-native';
import {Octicons, Ionicons, Fontisto } from '@expo/vector-icons';
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


const Welcome = () => {
    const [hidePassword, setHidePassword] = useState(true);
    return(
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/img/image1.png')} />
                <PageTitle>Music Roulette</PageTitle>
                <SubTitle>Welcome</SubTitle>
                <Formik
                    initialValues={{email: '', password: ''}}
                    onSubmit={(values) => {
                        console.log(values);
                    }}>
                    {({handleChange, handleBlur, handleSubmit, values}) => (<StyledFormArea> 
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
                            <MsgBox>...</MsgBox>

                            <StyledButton onPress={handleSubmit}>
                                <ButtonText> 
                                    Login
                                </ButtonText>
                            </StyledButton>
                            <Line />

                            <StyledButton google={true} onPress={handleSubmit}>
                                <Fontisto name="google" color={primary} size={25} />
                                <ButtonText google={true}> 
                                    Sign in with Google
                                </ButtonText>
                            </StyledButton>
                            <ExtraView>
                                <ExtraText>Don't have an account already? </ExtraText>
                                <TextLink>
                                    <TextLinkContent>Signup</TextLinkContent>
                                </TextLink>
                            </ExtraView>

                    </StyledFormArea>)}

                        
                    
                </Formik>
            </InnerContainer>
        </StyledContainer>
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
export default Welcome;