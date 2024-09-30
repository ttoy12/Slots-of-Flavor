"use client"
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
            setLiked(likedPlaces.some((liked: Business) => liked.id === randomBusiness.id))
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
        if (!user) return; // checking if user is authenticated

        // if already liked, remove it
        if (liked) {
            await removedLikedPlace(user.uid, randomBusiness);
        } else {
            // if disliked, remove dislike first
            if (disliked) {
                await removedDislikedPlace(user.uid, randomBusiness);
                setDisliked(false);
            }

            await addLikedPlace(user.uid, randomBusiness);
        }
        setLiked((prev) => !prev); // toggleing liked state
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

        setDisliked((prev) => (!prev));
    }

    return (
        <div className="z-20 container p-2">
            <div>
                {randomBusiness ? (
                    <div className='text-white flex flex-col justify-center items-center'>
                        <Tooltip title={randomBusiness.url} arrow>
                            <a
                                href={randomBusiness.url}
                                className="hover:text-green-800 hover:underline transition duration-200"
                                rel="noreferrer noopener"
                                target="_blank"
                            >
                                <p className="font-semibold text-[24px] ">

                                    {randomBusiness.name}
                                </p>
                            </a>
                        </Tooltip>
                        {randomBusiness.image_url && (
                            <img
                                src={randomBusiness.image_url}
                                alt={`${randomBusiness.name} image`}
                                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                            />
                        )}
                        {randomBusiness.location && (
                            <div>
                                {randomBusiness.location.display_address.map((line: string, index: number) => (
                                    <p key={index}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        )}

                        <Tooltip title="Share" arrow className="m-2">
                            <IosShareIcon className="cursor-pointer hover:text-blue-500 hover:scale-105 transition duration-200" fontSize="small" onClick={handleShare} />
                            {/* <ContentCopyIcon fontSize="small" onClick={() => navigator.clipboard.writeText(randomBusiness.url)} /> */}
                        </Tooltip>

                        <div className="flex flex-row">
                            <ThumbUpIcon className={`mx-2 cursor-pointer ${liked ? 'text-white' : 'text-gray-400'} hover:scale-110 hover:text-white`} onClick={handleLiked} />
                            <ThumbDownIcon className={`mx-2 cursor-pointer ${disliked ? 'text-white' : 'text-gray-400'}  hover:scale-110 hover:text-white`} onClick={handleDislike} />
                        </div>
                    </div>
                ) : (
                    <div className='text-white'>No businesses found. Explore different search queries.</div>
                )}
            </div>
        </div>
    );
}
