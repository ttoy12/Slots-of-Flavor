"use client"
import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from '@mui/material';
import { getLikedPlaces, getDislikedPlaces } from '@/app/firebase/firestore';
import TitlebarImageList from './ImageList';

const TabsComponent: React.FC<{ userID: string }> = ({ userID }) => {
    const [value, setValue] = React.useState(0); // used to see which tab
    const [likedPlaces, setLikedPlaces] = useState<any[]>([]);
    const [dislikedPlaces, setDislikedPlaaces] = useState<any[]>([]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        const fetchLikedPlaces = async () => {
            const liked = await getLikedPlaces(userID);
            setLikedPlaces(liked);
        };

        const fetchDislikedPlaces = async () => {
            const disliked = await getDislikedPlaces(userID);
            setDislikedPlaaces(disliked);
        };

        fetchLikedPlaces();
        fetchDislikedPlaces();
    }, [userID]);

    return (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-md shadow-lg">
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Liked" />
                <Tab label="Disliked" />
            </Tabs>
            <div className="p-4">
                {value === 0 && (
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">Liked places</h2>
                        {likedPlaces.length > 0 ? (
                            <div>
                                <TitlebarImageList itemData={[...likedPlaces]} />
                            </div>
                        ) : (
                            <p>No liked places yet!</p>
                        )}
                    </div>
                )}
                {value === 1 && (
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">Disliked places</h2>
                        {dislikedPlaces.length > 0 ? (
                            <div>
                                <TitlebarImageList itemData={[...dislikedPlaces]} />
                            </div>
                        ) : (
                            <p>No disliked places yet!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default TabsComponent;
