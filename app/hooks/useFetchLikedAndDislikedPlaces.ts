import { useEffect, useState } from 'react';
import { getLikedPlaces, getDislikedPlaces } from '../firebase/firestore';

const useFetchLikedAndDislikedPlaces = (userID?: string | null) => {
    const [likedPlaces, setLikedPlaces] = useState<any[]>([]);
    const [dislikedPlaces, setDislikedPlaces] = useState<any[]>([]);
    const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);

    useEffect(() => {
        if (!userID) {
            setLikedPlaces([]);
            setDislikedPlaces([]);
            return;
        }

        const fetchLikedPlaces = async () => {
            const liked = await getLikedPlaces(userID);
            setLikedPlaces(liked);
        };

        const fetchDislikedPlaces = async () => {
            const disliked = await getDislikedPlaces(userID);
            setDislikedPlaces(disliked);
        };

        fetchLikedPlaces();
        fetchDislikedPlaces();
    }, [userID, shouldUpdate]);

    const handleUpdate = () => {
        setShouldUpdate(prev => !prev);
    };

    return { likedPlaces, dislikedPlaces, handleUpdate };
};

export default useFetchLikedAndDislikedPlaces;
