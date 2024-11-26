import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Button, Alert } from 'react-native';
import axios from 'axios';
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledButton, ButtonText } from '../components/style';

const GameScreen = ({ navigation, route }) => {
    const { lobbyId, userName } = route.params;
    const [loading, setLoading] = useState(true);
    const [roundData, setRoundData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);

    const url = 'https://8919-2a02-2f0e-3904-3900-e0f8-a8c2-f7cb-b776.ngrok-free.app';

    // Load the game and start rounds
    useEffect(() => {
        fetchNextRound();
    }, []);

    // Timer logic for each round
    useEffect(() => {
        if (timeLeft <= 0) fetchNextRound();
        const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchNextRound = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/game/nextRound?lobbyId=${lobbyId}`);
            if (response.data.status === 'SUCCESS') {
                setRoundData(response.data.roundData);
                setTimeLeft(30);  // Reset timer
            } else if (response.data.status === 'COMPLETE') {
                Alert.alert('Game Over', 'Thanks for playing!');
                navigation.goBack();
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching next round:', error);
        }
    };
    
    const handleVote = async (player) => {
        try {
            const response = await axios.post(`${url}/game/vote`, { lobbyId, player, voter: userName });
            if (response.data.status === 'SUCCESS') {
                Alert.alert('Vote Registered!', response.data.message);
            } else {
                Alert.alert('Incorrect Guess', 'Try again next round!');
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

    return (
        <StyledContainer>
            <InnerContainer>
                <PageTitle>Round {roundData?.roundNumber}</PageTitle>
                <SubTitle>Who chose this song?</SubTitle>
                <Text>🎵 {roundData?.song.title} - {roundData?.song.artist}</Text>
                <SubTitle>Time left: {timeLeft}s</SubTitle>
                <FlatList
                    data={roundData?.players || []}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <StyledButton onPress={() => handleVote(item)}>
                            <ButtonText>{item}</ButtonText>
                        </StyledButton>
                    )}
                />
            </InnerContainer>
        </StyledContainer>
    );
};

export default GameScreen;
