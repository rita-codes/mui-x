import * as React from 'react';
import dayjs from 'dayjs';
import InputAdornment from '@mui/material/InputAdornment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';

import { MultiInputDateRangeField } from '@mui/x-date-pickers-pro/MultiInputDateRangeField';

function CustomInputAdornment(props) {
  const { hasError, children, sx, ...other } = props;
  return (
    <InputAdornment {...other}>
      <PriorityHighIcon
        color="error"
        sx={[
          hasError
            ? {
                opacity: 1,
              }
            : {
                opacity: 0,
              },
        ]}
      />
      {children}
    </InputAdornment>
  );
}

export default function AddWarningIconWhenInvalidRange() {
  const [error, setError] = React.useState([null, null]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DateRangePicker']}>
        <DateRangePicker
          label="Picker with error icon"
          maxDate={dayjs('2022-04-19')}
          defaultValue={[dayjs('2022-04-18'), dayjs('2022-04-21')]}
          onError={setError}
          slots={{ field: MultiInputDateRangeField }}
          slotProps={{
            textField: ({ position }) => ({
              InputProps: {
                endAdornment: (
                  <CustomInputAdornment
                    position="end"
                    hasError={!!error[position === 'start' ? 0 : 1]}
                  />
                ),
              },
            }),
          }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
