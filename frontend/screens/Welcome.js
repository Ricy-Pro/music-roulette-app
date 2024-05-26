// screens/Welcome.js
import React, { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import axios from 'axios';
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledFormArea, StyledButton, ButtonText, MsgBox, ExtraView, ExtraText, TextLink, TextLinkContent } from '../components/style';
import {nanoid} from 'nanoid';
const Welcome = ({ navigation, route}) => {
    const [lobbyId, setLobbyId] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
   
    const { userData } = route.params;
    
    const handleCreateLobby = () => {
        axios.post('http://192.168.1.8:3000/lobby/create', { host: userData.name })
            .then(response => {
                const { status, message, lobby } = response.data;
                if (status === 'SUCCESS') {
                    setMessage(`Lobby created: ${lobby._id}`);
                    setMessageType('SUCCESS');
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
        axios.post('http://192.168.1.8:3000/lobby/join', { lobbyId, participant: userData.name })
            .then(response => {
                const { status, message, updatedLobby } = response.data;
                if (status === 'SUCCESS') {
                    setMessage(`Joined lobby: ${updatedLobby._id}`);
                    setMessageType('SUCCESS');
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
                    <MsgBox type={messageType}>{message}</MsgBox>
                </StyledFormArea>
            </InnerContainer>
        </StyledContainer>
    );
};

export default Welcome;
