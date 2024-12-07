'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config';

const withAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          router.push('/admin/sign-in');
        }
      });

      return () => unsubscribe();
    }, [router]);

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <p>Loading...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} user={user} />;
  };
};

export default withAuth;
