import React, { useState } from 'react';
import { View, Text, TextInput, Button, Linking, Alert } from 'react-native';
import axios from 'axios';
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledFormArea, StyledButton, ButtonText, MsgBox } from '../components/style';

const url = 'https://8919-2a02-2f0e-3904-3900-e0f8-a8c2-f7cb-b776.ngrok-free.app';

const Welcome = ({ navigation, route }) => {
    const [lobbyId, setLobbyId] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const { userData } = route.params;
    const userName = userData.name;

    const handleCreateLobby = () => {
        axios.post(`${url}/lobby/create`, { host: userName })
            .then(response => {
                const { status, message, lobby } = response.data;
                if (status === 'SUCCESS') {
                    setMessage(`Lobby created: ${lobby._id}`);
                    setMessageType('SUCCESS');
                    navigation.navigate('Lobby', { lobbyId: lobby._id, userName, host: userName });
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
        axios.post(`${url}/lobby/join`, { lobbyId, participant: userName })
            .then(response => {
                const { status, message, updatedLobby } = response.data;
                if (status === 'SUCCESS') {
                    setMessage(`Joined lobby: ${updatedLobby._id}`);
                    setMessageType('SUCCESS');
                    navigation.navigate('Lobby', { lobbyId: updatedLobby._id, userName, host: null });
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
        const authURL = `${url}/ytmusic/auth/setup`;
    
        try {
            // Start the OAuth process with a POST request (sends userName)
            axios.post(authURL, { userName });
    
            // Wait for OAuth to complete (you can adjust the delay if needed)
            await new Promise(resolve => setTimeout(resolve, 7000)); 
    
            // Fetch the resulting URL after authentication
            const response = await axios.get(`${url}/ytmusic/auth/url`);
            const fetchedURL = response.data;
            console.log('Fetched URL:', fetchedURL);
            // Open the fetched URL in the browser
            await Linking.openURL(fetchedURL);
    
        } catch (error) {
            console.error('Error during auth setup:', error);
            Alert.alert('Error during authentication setup. Please try again.');
        }
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
