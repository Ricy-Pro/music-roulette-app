import React, { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, Text, Alert } from 'react-native';
import axios from 'axios';
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledButton, ButtonText } from '../components/style';

const url = 'https://8919-2a02-2f0e-3904-3900-e0f8-a8c2-f7cb-b776.ngrok-free.app';

const Lobby = ({ navigation, route }) => {
    const { lobbyId, userName, host } = route.params; // Extract userName and host
    console.log('Lobby ID:', lobbyId);
    console.log('User Name:', userName);
    console.log('Host:', host); // Debug log

    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLobbyDetails = () => {
            axios.get(`${url}/lobby/${lobbyId}`)
                .then(response => {
                    const { status, lobby } = response.data;
                    if (status === 'SUCCESS') {
                        setParticipants(lobby.participants);
                    } else {
                        console.error('Failed to fetch lobby data:', response.data.message);
                    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('An error occurred while fetching lobby data:', error);
                    setLoading(false);
                });
        };

        const pollEvents = async () => {
            while (true) {
                try {
                    const response = await axios.get(`${url}/lobby/events`);
                    const message = response.data;
        
                    console.log('Polling message received:', message);
        
                    // Ensure the message object is defined and has the expected properties
                    if (message && message.status === 'SUCCESS') {
                        if (message.updatedLobby && message.updatedLobby._id === lobbyId) {
                            setParticipants(message.updatedLobby.participants);
                            console.log('Participants updated:', message.updatedLobby.participants);
                        } 
                        // Check if the game has started
                        else if (message.message === 'Game started' && message.lobby._id === lobbyId) {
                            console.log('Game started! Navigating to GameScreen...');
                            navigation.navigate('GameScreen', { lobbyId: message.lobby._id, userName });
                            break; // Exit the polling loop if the game has started
                        }
                        // Handle lobby deletion
                        else if (message.message === 'Lobby deleted as host left' && message.lobbyId === lobbyId) {
                            navigation.navigate('Welcome', { userData: { name: userName } });
                            break;  // Exit the loop if the lobby is deleted
                        }
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }
        };
        

        fetchLobbyDetails();
        pollEvents();

        return () => {
            // Cleanup function if needed
        };
    }, [lobbyId, userName, navigation]); // Added userName and navigation as dependencies

    const handleStartGame = () => {
        axios.post(`${url}/game/start`, { lobbyId })
            .then(response => {
                const { status, message, lobby } = response.data;
                if (status === 'SUCCESS') {
                    console.log('Game started');
                    // Navigate to GameScreen for the host
                    navigation.navigate('GameScreen', { lobbyId: lobby._id, userName });
                } else {
                    console.error('Failed to start game:', message);
                }
            })
            .catch(error => {
                console.error('An error occurred while starting the game:', error);
            });
    };
    

    const handleBackPress = () => {
        Alert.alert(
            "Leave Lobby",
            "Are you sure you want to leave the lobby?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => {
                        console.log('Leaving lobby:', lobbyId, 'Participant:', userName); // Debug log
                        axios.post(`${url}/lobby/leave`, { lobbyId, participant: userName })
                            .then(response => {
                                const { status, message, updatedLobby } = response.data;
                                if (status === 'SUCCESS') {
                                    console.log(message);
                                    if (message === 'Lobby deleted') {
                                        navigation.navigate('Welcome', { userData: { name: userName } });
                                    } else {
                                        console.log('Lobby updated:', updatedLobby);
                                        navigation.navigate('Welcome', { userData: { name: userName } });
                                    }
                                } else {
                                    console.error('Failed to leave lobby:', message);
                                }
                            })
                            .catch(error => {
                                console.error('An error occurred while leaving the lobby:', error);
                            });
                    }
                }
            ]
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <StyledContainer>
            <InnerContainer>
                <PageTitle>Lobby: {lobbyId}</PageTitle>
                <SubTitle>Participants:</SubTitle>
                <FlatList
                    data={participants}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <Text>{item}</Text>}
                />
                <StyledButton onPress={handleStartGame}>
                    <ButtonText>Start Game</ButtonText>
                </StyledButton>
                <StyledButton onPress={handleBackPress}>
                    <ButtonText>Back to Welcome</ButtonText>
                </StyledButton>
            </InnerContainer>
        </StyledContainer>
    );
};

export default Lobby;
