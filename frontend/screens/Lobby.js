import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledButton, ButtonText } from '../components/style';

const Lobby = ({ navigation, route }) => {
    const { lobbyId, host } = route.params;
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://192.168.1.8:3000/lobby/${lobbyId}`)
            .then(response => {
                const { status, lobby } = response.data;
                if (status === 'SUCCESS') {
                    setParticipants(lobby.participants);
                } else {
                    console.log('Failed to fetch lobby data');
                }
                setLoading(false);
            })
            .catch(error => {
                console.log('An error occurred:', error);
                setLoading(false);
            });

        // Clean up function to delete the lobby when the host leaves the page
        return () => {
            if (host) {
                axios.post('http://192.168.1.8:3000/lobby/delete', { host })
                    .then(response => {
                        console.log(response.data.message);
                    })
                    .catch(error => {
                        console.log('An error occurred:', error);
                    });
            }
        };
    }, []);

    const handleStartGame = () => {
        // Add your game starting logic here
        console.log('Game started');
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
                        navigation.navigate('Welcome', { userData: { name: host } });
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
