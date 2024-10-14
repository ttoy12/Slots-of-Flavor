"use client"
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { auth } from '../firebase/firebaseConfig'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import Cookies from 'js-cookie'
import Link from 'next/link';
import Image from 'next/image';

const settings = [
    { name: 'Profile' },
    { name: 'Logout' },
];

function ResponsiveAppBar() {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const router = useRouter();

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = (setting: string) => {
        setAnchorElUser(null);
        if (setting === 'Logout') {
            handleLogout();
        }
        if (setting === 'Profile') {
            router.push('/profile');
        }
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            Cookies.remove('user');
            router.push('/sign-in');
        }).catch((error) => {
            console.error("Logout error:", error);
        });
    };

    return (
        <AppBar position="static"
            sx={{
                backgroundColor: '#f7f7f7',
                zIndex: 1000,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                borderBottom: '2px solid #ccc'
            }}>
            <Container maxWidth="xl" sx={{ padding: 2 }}>
                <Toolbar disableGutters>
                    <Link href="/" className="hover:text-yellow-500">
                        <Image src="/slots-of-flavor-high-resolution-logo-transparent.png" alt="logo" height={250} width={250}
                            className="hover:bg-yellow-500"
                        />
                    </Link>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar className="hover:bg-yellow-500" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem
                                    key={setting.name}
                                    onClick={() => handleCloseUserMenu(setting.name)}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ textAlign: 'center' }}>{setting.name}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;