'use client';

interface ErrorMessageProps {
    message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '10px' }}>
            {message}
        </div>
    );
}