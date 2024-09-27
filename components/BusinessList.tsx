"use client"
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Tooltip } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useState } from 'react';
import { addLikedPlace, addDislikedPlace, removedLikedPlace } from '@/app/firebase/firestore';
import { auth } from '../app/firebase/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function BusinessList({ randomBusiness }: any) {
    // const randomIndex = Math.floor(Math.random() * businessesData.length);
    // const randomBusiness = businessesData[randomIndex];

    const [user, loading] = useAuthState(auth);
    const [liked, setLiked] = useState<boolean>(false);
    const [disliked, setDisliked] = useState<boolean>(false);

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

    const handleLiked = () => {
        setLiked((prev) => !prev);
        if (disliked) {
            setDisliked(false);
        }
    };

    const handleDislike = async () => {
        setDisliked((prev) => (!prev));
        if (liked) {
            setLiked(false);
        }
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
                                src={`${randomBusiness.image_url}`}
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
                            <IosShareIcon className="cursor-pointer hover:text-blue-500 hover:scale-105 transition duration-300" fontSize="small" onClick={handleShare} />
                            {/* <ContentCopyIcon fontSize="small" onClick={() => navigator.clipboard.writeText(randomBusiness.url)} /> */}
                        </Tooltip>

                        <div className="flex flex-row">
                            <ThumbUpIcon className={`mx-2 cursor-pointer ${liked ? 'text-white' : 'text-gray-300'} hover:scale-110`} onClick={handleLiked} />
                            <ThumbDownIcon className={`mx-2 cursor-pointer ${disliked ? 'text-white' : 'text-gray-300'}  hover:scale-110`} onClick={handleDislike} />
                        </div>
                    </div>
                ) : (
                    <div className='text-white'>No businesses found. Explore different search queries.</div>
                )}
            </div>
        </div>
    );
}
