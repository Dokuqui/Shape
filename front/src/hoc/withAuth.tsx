'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth(Component: React.FC) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function ProtectedComponent(props: any) {
        const router = useRouter();

        useEffect(() => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/admin/connection');
            }
        }, []);

        return <Component {...props} />;
    };
}
