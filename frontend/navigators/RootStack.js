import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Login from './../screens/Login';
import Signup from './../screens/Signup';
import Welcome from './../screens/Welcome';
import Lobby from './../screens/Lobby';
import GameScreen from './../screens/GameScreen'; // Import the new game screen
import { Colors } from './../components/style';

const Stack = createNativeStackNavigator();

const RootStack = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator 
               screenOptions={{
                     headerStyle: {
                     backgroundColor: 'transparent'
                    },
                    headerTintColor: Colors.tertiary,
                    headerTransparent: true,
                    headerTitle: '',
                    headerLeftContainerStyle: {
                        paddingLeft: 20
                    }
               }}
               initialRouteName='Login'
               >
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Signup" component={Signup} />
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="Lobby" component={Lobby} />
                <Stack.Screen name="GameScreen" component={GameScreen} /> 
                
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default RootStack;
