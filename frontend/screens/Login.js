import React from 'react'
import{
    StyledContainer,
    InnerContainer,
    PageLogo,
    PageTitle,

} from '../components/style';
const Login = () => {
    return(
        <StyledContainer>
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/img/image1.png')} />
                <PageTitle>Music Roulette</PageTitle>
            </InnerContainer>
        </StyledContainer>
    );
}
export default Login;