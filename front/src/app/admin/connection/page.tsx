'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { login } from '@/lib/api';

interface ButtonProps {
  isLoading: boolean;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1e2f 0%, #2a2a3c 100%);
`;

const FormWrapper = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #1e1e2f;
  font-weight: 700;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isLoading'].includes(prop),
}) <ButtonProps>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: ${({ isLoading }) => (isLoading ? 'not-allowed' : 'pointer')};
  opacity: ${({ isLoading }) => (isLoading ? 0.7 : 1)};
  transition: background 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px; /* Prevent button from shrinking during text change */

  &:hover {
    background: ${({ isLoading }) => (isLoading ? '#007bff' : '#0056b3')};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4d4f;
  font-size: 0.9rem;
  text-align: center;
`;

export default function Connection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.access_token);
      router.push('/admin/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Email or password is incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Form onSubmit={handleSubmit}>
          <Title>Administrator Login</Title>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            value={email}
            placeholder="admin@example.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            placeholder="Your password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </Form>
      </FormWrapper>
    </Container>
  );
}