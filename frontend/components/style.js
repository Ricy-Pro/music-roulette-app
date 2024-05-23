import{View,Text,Image} from 'react-native';
import styled from 'styled-components';
import Constants from 'expo-constants';


const StatusBarHeight = Constants.statusBarHeight;
export const Colors ={
    primary: '#007bff',
    secondary: '#6c757d',
    tertiary: '#28a745',
    darklight: '#343a40',
    brand: '#6c757d',
    green: '#28a745',
    red: '#dc3545',

}
const{primary, secondary, tertiary, darklight, brand, green, red} = Colors;

export const StyledContainer = styled.View`
    flex: 1;
    padding: 25px;
    padding-top: ${StatusBarHeight + 10}px;
    background-color: ${primary};

`

export const InnerContainer = styled.View`
    flex: 1;
    width: 100%;
    align-items: center;
`
export const PageLogo = styled.Image`
    width: 250px;
    height: 200px;
`

export const PageTitle = styled.Text`
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    color: ${brand};
    padding: 10px;
`