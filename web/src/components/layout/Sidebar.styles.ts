import { styled } from '@mui/material/styles';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';

const SIDEBAR_COLLAPSED_WIDTH = 64;
const TRANSITION_DURATION = '0.3s';

export const StyledNav = styled('nav', {
  shouldForwardProp: (prop) => prop !== 'isCollapsed' && prop !== 'width',
})<{ isCollapsed: boolean; width: number }>(({ theme, isCollapsed, width }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : width,
  height: '100vh',
  background: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  transition: `width ${TRANSITION_DURATION} ease-in-out`,
  overflowX: 'hidden',
  overflowY: 'auto',
  zIndex: theme.zIndex.drawer,
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: 4
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent'
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[300],
    borderRadius: 2
  }
}));

export const StyledList = styled(List)(({ theme }) => ({
  padding: 0,
  margin: 0
}));

export const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  backgroundColor: active ? theme.palette.primary.light : 'transparent',
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.light : theme.palette.action.hover,
  }
}));

export const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  color: 'inherit'
}));

export const StyledListItemText = styled(ListItemText, {
  shouldForwardProp: (prop) => prop !== 'isCollapsed',
})<{ isCollapsed?: boolean }>(({ theme, isCollapsed }) => ({
  margin: 0,
  color: 'inherit',
  opacity: isCollapsed ? 0 : 1,
  transition: `opacity ${TRANSITION_DURATION} ease-in-out`,
  whiteSpace: 'nowrap'
})); 