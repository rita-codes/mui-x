import * as React from 'react';
import dayjs from 'dayjs';
import useId from '@mui/utils/useId';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DialogActions from '@mui/material/DialogActions';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar';
import { usePickerContext, usePickerTranslations } from '@mui/x-date-pickers/hooks';

function CustomActionBar(props: PickersActionBarProps) {
  const { actions, className } = props;
  const translations = usePickerTranslations();
  const {
    clearValue,
    setValueToToday,
    acceptValueChanges,
    cancelValueChanges,
    goToNextStep,
    hasNextStep,
  } = usePickerContext();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = useId();

  if (actions == null || actions.length === 0) {
    return null;
  }

  const menuItems = actions?.map((actionType) => {
    switch (actionType) {
      case 'clear':
        return (
          <MenuItem
            onClick={() => {
              clearValue();
              setAnchorEl(null);
            }}
            key={actionType}
          >
            {translations.clearButtonLabel}
          </MenuItem>
        );
      case 'cancel':
        return (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              cancelValueChanges();
            }}
            key={actionType}
          >
            {translations.cancelButtonLabel}
          </MenuItem>
        );
      case 'accept':
        return (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              acceptValueChanges();
            }}
            key={actionType}
          >
            {translations.okButtonLabel}
          </MenuItem>
        );
      case 'today':
        return (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setValueToToday();
            }}
            key={actionType}
          >
            {translations.todayButtonLabel}
          </MenuItem>
        );
      case 'next':
        return (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              goToNextStep();
            }}
            key={actionType}
          >
            {translations.nextStepButtonLabel}
          </MenuItem>
        );

      case 'nextOrAccept':
        if (hasNextStep) {
          return (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                goToNextStep();
              }}
              key={actionType}
            >
              {translations.nextStepButtonLabel}
            </MenuItem>
          );
        }

        return (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              acceptValueChanges();
            }}
            key={actionType}
          >
            {translations.okButtonLabel}
          </MenuItem>
        );
      default:
        return null;
    }
  });

  return (
    <DialogActions className={className}>
      <Button
        id={`picker-actions-${id}`}
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Actions
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          'aria-labelledby': `picker-actions-${id}`,
        }}
      >
        {menuItems}
      </Menu>
    </DialogActions>
  );
}

export default function ActionBarComponent() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StaticDatePicker
        defaultValue={dayjs('2022-04-17')}
        slots={{
          actionBar: CustomActionBar,
        }}
        slotProps={{
          actionBar: {
            actions: ['today'],
          },
        }}
      />
    </LocalizationProvider>
  );
}
