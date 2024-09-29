import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

interface ItemData {
    id: string;
    image_url: string;
    name: string;
    url: string;
    [key: string]: any;
}

interface TitlebarImageListProps {
    itemData: ItemData[];
}

const TitlebarImageList: React.FC<TitlebarImageListProps> = ({ itemData }) => {
    return (
        <ImageList sx={{ width: 500, height: 450 }}>
            {itemData.map((item) => (
                <ImageListItem key={item.img} sx={{}}>
                    <img
                        srcSet={`${item.image_url}?w=100&fit=crop&auto=format&dpr=2 2x`}
                        src={`${item.image_url}?w=100&fit=crop&auto=format`}
                        alt={item.name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <ImageListItemBar
                        title={item.name}
                        subtitle={`${item.location.address1 || ''}${item.location.address2 ? ', ' + item.location.address2 : ''}${item.location.address3 ? ', ' + item.location.address3 : ''}, ${item.location.city}, ${item.location.country}`}
                        actionIcon={
                            <IconButton
                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                aria-label={`info about ${item.title}`}
                            >
                                <InfoIcon />
                            </IconButton>
                        }
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
}

export default TitlebarImageList;