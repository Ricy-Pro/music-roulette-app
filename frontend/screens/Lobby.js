// ... other imports
import axios from 'axios';
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledButton, ButtonText } from '../components/style';
import { useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, Text, Alert } from 'react-native';
const Lobby = ({ navigation, route }) => {
    const { lobbyId, host } = route.params;
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    url='https://e2b5-109-103-59-146.ngrok-free.app'
    useEffect(() => {
        axios.get(url+`/lobby/${lobbyId}`)
            .then(response => {
                const { status, lobby } = response.data;
                if (status === 'SUCCESS') {
                    setParticipants(lobby.participants,lobby.host);
                    
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
                axios.post(url+'/lobby/delete', { host })
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
        axios.post(url+'/game/start', { lobbyId })
            .then(response => {
                const { status, message, lobby } = response.data;
                if (status === 'SUCCESS') {
                    console.log('Game started');
                    navigation.navigate('GameScreen', { lobbyId: lobby._id, host });
                } else {
                    console.log(message);
                }
            })
            .catch(error => {
                console.log('An error occurred:', error);
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
