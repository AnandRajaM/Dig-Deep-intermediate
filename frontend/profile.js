import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/api/users/profile');
                setUser(response.data.user);
            } catch (err) {
                setError(err.response.data.message || 'Error fetching user data');
            }
        };

        fetchUserData();
    }, []);

    const handleDeleteAccount = async () => {
        try {
            await axios.delete(`/api/users/${user.id}`);
            alert('Account deleted successfully');
        } catch (err) {
            setError(err.response.data.message || 'Error deleting account');
        }
    };

    return (
        <div>
            {error && <p className="error">{error}</p>}
            {user && (
                <div>
                    <h1>{user.username}</h1>
                    <button onClick={handleDeleteAccount}>Delete Account</button>
                </div>
            )}
        </div>
    );
};

export default Profile;
