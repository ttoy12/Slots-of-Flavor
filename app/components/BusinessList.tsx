"use client";
import IosShareIcon from '@mui/icons-material/IosShare';
import { Tooltip } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useState, useEffect } from 'react';
import { addLikedPlace, addDislikedPlace, removedLikedPlace, removedDislikedPlace, Business } from '@/app/firebase/firestore';
import { auth } from '../firebase/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function BusinessList({ randomBusiness, likedPlaces }: any) {
    const [user, loading] = useAuthState(auth);
    const [liked, setLiked] = useState<boolean>(false);
    const [disliked, setDisliked] = useState<boolean>(false);

    // Reset liked and disliked states when randomBusiness changes
    useEffect(() => {
        if (randomBusiness) {
            setLiked(likedPlaces.some((liked: Business) => liked.id === randomBusiness.id));
            setDisliked(false);
        }
    }, [randomBusiness, likedPlaces]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: randomBusiness.name || 'Check this out!',
                    url: randomBusiness.url,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert('Sharing not supported on this browser.'); // Fallback
        }
    };

    const handleLiked = async () => {
        if (!user) return;

        if (liked) {
            await removedLikedPlace(user.uid, randomBusiness);
        } else {
            if (disliked) {
                await removedDislikedPlace(user.uid, randomBusiness);
                setDisliked(false);
            }
            await addLikedPlace(user.uid, randomBusiness);
        }
        setLiked((prev) => !prev);
    };

    const handleDislike = async () => {
        if (!user) return;

        if (disliked) {
            await removedDislikedPlace(user.uid, randomBusiness);
        } else {
            if (liked) {
                await removedLikedPlace(user.uid, randomBusiness);
                setLiked(false);
            }
            await addDislikedPlace(user.uid, randomBusiness);
        }

        setDisliked((prev) => !prev);
    };

    return (
        <div className="z-20 container p-4 bg-white shadow-lg rounded-lg">
            {randomBusiness ? (
                <div className='flex flex-col items-center text-gray-800'>
                    <Tooltip title={randomBusiness.url} arrow>
                        <a
                            href={randomBusiness.url}
                            className="hover:text-blue-600 hover:underline transition duration-200"
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <p className="font-semibold text-lg mb-2">
                                {randomBusiness.name}
                            </p>
                        </a>
                    </Tooltip>
                    {randomBusiness.image_url && (
                        <img
                            src={randomBusiness.image_url}
                            alt={`${randomBusiness.name} image`}
                            className="w-32 h-32 object-cover rounded-md mb-2"
                        />
                    )}
                    {randomBusiness.location && (
                        <div className="text-center mb-2">
                            {randomBusiness.location.display_address.map((line: string, index: number) => (
                                <p key={index} className="text-sm">
                                    {line}
                                </p>
                            ))}
                        </div>
                    )}

                    <Tooltip title="Share" arrow>
                        <IosShareIcon className="cursor-pointer hover:text-blue-500 transition duration-200" fontSize="medium" onClick={handleShare} />
                    </Tooltip>

                    <div className="flex justify-center mt-2">
                        <ThumbUpIcon
                            className={`mx-2 cursor-pointer ${liked ? 'text-green-600' : 'text-gray-400'} hover:scale-110`}
                            onClick={handleLiked}
                        />
                        <ThumbDownIcon
                            className={`mx-2 cursor-pointer ${disliked ? 'text-red-600' : 'text-gray-400'} hover:scale-110`}
                            onClick={handleDislike}
                        />
                    </div>
                </div>
            ) : (
                <div className='text-gray-500'>No businesses found. Explore different search queries.</div>
            )}
        </div>
    );
}
