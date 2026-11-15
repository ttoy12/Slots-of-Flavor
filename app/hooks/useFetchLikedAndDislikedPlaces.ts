import { useEffect, useState } from 'react';
import { getLikedPlaces, getDislikedPlaces, getVisitedPlaces, Business } from '../firebase/firestore';

const useFetchLikedAndDislikedPlaces = (userID?: string | null) => {
    const [likedPlaces, setLikedPlaces] = useState<Business[]>([]);
    const [dislikedPlaces, setDislikedPlaces] = useState<Business[]>([]);
    const [visitedPlaces, setVisitedPlaces] = useState<Business[]>([]);
    const [loadedFor, setLoadedFor] = useState<string | null>(null);
    const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);

    useEffect(() => {
        if (!userID) return;

        // Sequential so the one-time legacy migration runs before the second read.
        const fetchPlaces = async () => {
            setLikedPlaces(await getLikedPlaces(userID));
            setDislikedPlaces(await getDislikedPlaces(userID));
            setVisitedPlaces(await getVisitedPlaces(userID));
            setLoadedFor(userID);
        };

        fetchPlaces();
    }, [userID, shouldUpdate]);

    const handleUpdate = () => {
        setShouldUpdate(prev => !prev);
    };

    return {
        likedPlaces: userID ? likedPlaces : [],
        dislikedPlaces: userID ? dislikedPlaces : [],
        visitedPlaces: userID ? visitedPlaces : [],
        loading: !!userID && loadedFor !== userID,
        handleUpdate,
    };
};

export default useFetchLikedAndDislikedPlaces;
