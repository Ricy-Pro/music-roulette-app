import React, { useState } from 'react';
import { View, Text, TextInput, Button, Linking, Alert } from 'react-native';
import axios from 'axios';
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledFormArea, StyledButton, ButtonText, MsgBox } from '../components/style';
url='https://e2b5-109-103-59-146.ngrok-free.app';
const Welcome = ({ navigation, route }) => {
    const [lobbyId, setLobbyId] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const { userData } = route.params;

    const handleCreateLobby = () => {
        axios.post(url+'/lobby/create', { host: userData.name })
            .then(response => {
                const { status, message, lobby } = response.data;
                if (status === 'SUCCESS') {
                    setMessage(`Lobby created: ${lobby._id}`);
                    setMessageType('SUCCESS');
                    navigation.navigate('Lobby', { lobbyId: lobby._id, host: userData.name });
                    
                } else {
                    setMessage(message);
                    setMessageType('FAILED');
                }
            })
            .catch(error => {
                setMessage('An error occurred. Try again.');
                setMessageType('FAILED');
            });
    };

    const handleJoinLobby = () => {
        if (lobbyId === '') {
            setMessage('Please enter a lobby ID');
            setMessageType('FAILED');
            return;
        }
        axios.post(url+'/lobby/join', { lobbyId, participant: userData.name })
            .then(response => {
                const { status, message, updatedLobby } = response.data;
                if (status === 'SUCCESS') {
                    setMessage(`Joined lobby: ${updatedLobby._id}`);
                    setMessageType('SUCCESS');
                    navigation.navigate('Lobby', { lobbyId: updatedLobby._id, host: null });
                } else {
                    setMessage(message);
                    setMessageType('FAILED');
                }
            })
            .catch(error => {
                setMessage('An error occurred. Try again.');
                setMessageType('FAILED');
            });
    };

    const handleAuthSetup = async () => {
        const authURL = url+'/ytmusic/auth/setup';
        Linking.openURL(authURL)
            .then(() => {
                // Wait for some time to allow the OAuth process to complete and url.txt to be created
                setTimeout(async () => {
                    try {
                        const response = await axios.get(url+'/auth/url');
                        const fetchedURL = response.data;
                        Linking.openURL(fetchedURL)
                            .catch(error => {
                                console.error('Error opening URL:', error);
                                Alert.alert('Error opening URL. Please try again.');
                            });
                    } catch (error) {
                        console.error('Error fetching auth URL:', error);
                        Alert.alert('Error fetching auth URL. Please try again.');
                    }
                }, 3000); // Adjust this delay as needed based on the time it takes for the file to be created
            })
            .catch(error => {
                console.error('Error opening URL:', error);
                Alert.alert('Error opening URL. Please try again.');
            });
    };

    return (
        <StyledContainer>
            <InnerContainer>
                <PageTitle>Welcome to Music Roulette</PageTitle>
                <SubTitle>Create or Join a Lobby</SubTitle>
                <StyledFormArea>
                    <StyledButton onPress={handleCreateLobby}>
                        <ButtonText>Create Lobby</ButtonText>
                    </StyledButton>
                    <TextInput
                        placeholder="Enter Lobby ID"
                        value={lobbyId}
                        onChangeText={setLobbyId}
                    />
                    <StyledButton onPress={handleJoinLobby}>
                        <ButtonText>Join Lobby</ButtonText>
                    </StyledButton>
                    <StyledButton onPress={handleAuthSetup}>
                        <ButtonText>Connect to YouTube Music</ButtonText>
                    </StyledButton>
                    <MsgBox type={messageType}>{message}</MsgBox>
                </StyledFormArea>
            </InnerContainer>
        </StyledContainer>
    );
};

export default Welcome;
