import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledButton, ButtonText } from '../components/style';

const GameScreen = ({ navigation, route }) => {
    const { lobbyId, host } = route.params;
    const [loading, setLoading] = useState(true);
    const [lobby, setLobby] = useState(null);
    url='https://c7cd-5-13-177-212.ngrok-free.app'
    useEffect(() => {
        axios.get(url+`/lobby/${lobbyId}`)
            .then(response => {
                console.log('Lobby data response:', response.data); // Add logging here
                const { status, lobby } = response.data;
                if (status === 'SUCCESS') {
                    setLobby(lobby);
                    
                } else {
                    console.log('Failed to fetch lobby data:', response.data.message);
                }
                setLoading(false);
            })
            .catch(error => {
                console.log('An error occurred while fetching lobby data:', error);
                setLoading(false);
            });

        // Clean up function to delete the lobby when the host leaves the page
        return () => {
            if (host) {
                axios.post(url+'/lobby/delete', { host })
                    .then(response => {
                        console.log('Lobby deletion response:', response.data.message);
                    })
                    .catch(error => {
                        console.log('An error occurred while deleting the lobby:', error);
                    });
            }
        };
    }, [host, lobbyId]);

    const handlePlayerAction = (action) => {
        axios.post(url+'/game/action', { lobbyId, playerId: host, action })
            .then(response => {
                console.log('Player action response:', response.data); // Add logging here
                const { status, message, lobby } = response.data;
                if (status === 'SUCCESS') {
                    setLobby(lobby);
                } else {
                    console.log('Failed to process action:', message);
                }
            })
            .catch(error => {
                console.log('An error occurred while processing player action:', error);
            });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!lobby) {
        return (
            <StyledContainer>
                <InnerContainer>
                    <PageTitle>Error</PageTitle>
                    <SubTitle>Failed to load lobby data.</SubTitle>
                </InnerContainer>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <InnerContainer>
                <PageTitle>Game: {lobbyId}</PageTitle>
                <SubTitle>Participants:</SubTitle>
                <FlatList
                    data={lobby.participants}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <Text>{item}</Text>}
                />
                <StyledButton onPress={() => handlePlayerAction('exampleAction')}>
                    <ButtonText>Perform Action</ButtonText>
                </StyledButton>
            </InnerContainer>
        </StyledContainer>
    );
};

export default GameScreen;
