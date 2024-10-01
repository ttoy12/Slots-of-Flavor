"use client"
import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoreOptionsMenu from './MoreOptionsMenu';
import { addLikedPlace, addDislikedPlace, removedLikedPlace, removedDislikedPlace, Business } from '../firebase/firestore';

interface ItemData {
    [key: string]: any;
}

interface TitlebarImageListProps {
    itemData: ItemData[];
    isLikedTab: boolean,
    userID: string,
    onUpdate: () => void,
}

const TitlebarImageList: React.FC<TitlebarImageListProps> = ({ itemData, isLikedTab, userID, onUpdate }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [currentItem, setCurrentItem] = React.useState<ItemData | null>(null);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, item: ItemData) => {
        setAnchorEl(event.currentTarget);
        setCurrentItem(item);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setCurrentItem(null);
        onUpdate();
    };

    const handleRemoveLike = async () => {
        if (!userID || !currentItem) return;
        await removedLikedPlace(userID, currentItem as Business);
        onUpdate();
    };

    const handleRemoveDislike = async () => {
        if (!userID || !currentItem) return;
        await removedDislikedPlace(userID, currentItem as Business);
        onUpdate();
    };

    const handleMoveToLikes = async () => {
        if (!userID || !currentItem) return;
        await addLikedPlace(userID, currentItem as Business);
        await removedDislikedPlace(userID, currentItem as Business);
        onUpdate();
    };

    const handleMoveToDislikes = async () => {
        if (!userID || !currentItem) return;
        await addDislikedPlace(userID, currentItem as Business);
        await removedLikedPlace(userID, currentItem as Business);
        onUpdate();
    };

    const handleVisitWebsite = () => {
        if (currentItem) {
            window.open(currentItem.url, '_blank', 'noreferrer, noopener');
        }
    };

    const menuOptions = isLikedTab
        ? [
            { label: 'Remove like', action: handleRemoveLike },
            { label: 'Move to Dislikes', action: handleMoveToDislikes },
            { label: 'Visit Website', action: handleVisitWebsite },
        ]
        : [
            { label: 'Remove dislike', action: handleRemoveDislike },
            { label: 'Move to Likes', action: handleMoveToLikes },
            { label: 'Visit Website', action: handleVisitWebsite },
        ];

    return (
        <>
            <ImageList sx={{ width: '100%', height: 'auto', maxHeight: 450 }}>
                {itemData.map((item) => (
                    <ImageListItem key={item.name} sx={{}}>
                        <img
                            srcSet={`${item.image_url}?w=100&fit=crop&auto=format&dpr=2 2x`}
                            src={`${item.image_url}?w=100&fit=crop&auto=format`}
                            alt={item.name}
                            loading="lazy"
                            style={{ width: 'auto', height: 'auto', objectFit: 'cover' }}
                        />
                        <ImageListItemBar
                            title={item.name}
                            subtitle={`${item.location.address1 || ''}${item.location.address2 ? ', ' + item.location.address2 : ''}${item.location.address3 ? ', ' + item.location.address3 : ''}, ${item.location.city}, ${item.location.country}`}
                            actionIcon={
                                <IconButton
                                    onClick={(event) => handleOpenMenu(event, item)}
                                    className="text-white hover:text-gray-400"
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <MoreOptionsMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                menuOptions={menuOptions}
            />
        </>
    );
}

export default TitlebarImageList;