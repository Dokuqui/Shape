'use client';

import withAuth from '@/hoc/withAuth';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.section`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e1e2f;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
`;

function Dashboard() {

    return (
        <Container>
            <WelcomeSection>
                <Title>Bienvenue 👋</Title>
                <Subtitle>Gérez vos contenus depuis ce tableau de bord.</Subtitle>
            </WelcomeSection>
        </Container>
    );
}


export default withAuth(Dashboard);