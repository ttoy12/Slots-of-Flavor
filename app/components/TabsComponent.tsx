"use client";
import React from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import TitlebarImageList from './ImageList';
import useFetchLikedAndDislikedPlaces from '../hooks/useFetchLikedAndDislikedPlaces';

const TabsComponent: React.FC<{ userID: string }> = ({ userID }) => {
    const [value, setValue] = React.useState(0);
    const { likedPlaces, dislikedPlaces, handleUpdate } = useFetchLikedAndDislikedPlaces(userID);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{
            width: '100%',
            maxWidth: 600,
            margin: 'auto',
            backgroundColor: '#f7f7f7',
        }}>
            <Tabs
                value={value}
                onChange={handleChange}
                aria-label="User Liked and Disliked Places"
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                        color: 'text.primary',
                        '&.Mui-selected': {
                            color: 'primary.main',
                        },
                    },
                }}
            >
                <Tab label="Liked" className="hover:bg-gray-200" />
                <Tab label="Disliked" className="hover:bg-gray-200" />
            </Tabs>
            <Box>
                {value === 0 && (
                    <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>
                            Liked: {likedPlaces.length}
                        </Typography>
                        {likedPlaces.length > 0 ? (
                            <TitlebarImageList
                                itemData={[...likedPlaces]}
                                isLikedTab={true}
                                userID={userID}
                                onUpdate={handleUpdate}
                            />
                        ) : (
                            <Typography variant="body1">No liked places yet!</Typography>
                        )}
                    </Box>
                )}
                {value === 1 && (
                    <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>
                            Disliked: {dislikedPlaces.length}
                        </Typography>
                        {dislikedPlaces.length > 0 ? (
                            <TitlebarImageList
                                itemData={[...dislikedPlaces]}
                                isLikedTab={false}
                                userID={userID}
                                onUpdate={handleUpdate}
                            />
                        ) : (
                            <Typography variant="body1">No disliked places yet!</Typography>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TabsComponent;
