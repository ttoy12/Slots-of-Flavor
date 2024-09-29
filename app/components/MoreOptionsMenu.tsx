import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface MenuOption {
    label: string;
    action: () => void;
}

interface MoreOptionsMenuProps {
    anchorEl: null | HTMLElement;
    open: boolean;
    onClose: () => void;
    menuOptions: MenuOption[];
}

const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({
    anchorEl,
    open,
    onClose,
    menuOptions,
}) => {
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
        >
            {menuOptions.map((option, index) => (
                <MenuItem key={index} onClick={() => { option.action(); onClose(); }}>
                    {option.label}
                </MenuItem>
            ))}
        </Menu>
    );
};

export default MoreOptionsMenu;
