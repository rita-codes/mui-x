import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { render, cleanup } from '@testing-library/react';
import { describe } from 'vitest';
import { BarChart } from '@mui/x-charts/BarChart';
import { options } from '../utils/options';
import { bench } from '../utils/bench';

describe('BarChart', () => {
  const dataLength = 800;
  const data = Array.from({ length: dataLength + 1 }).map((_, i) => ({
    x: i,
    y: 50 + Math.sin(i / 5) * 25,
  }));

  const xData = data.map((d) => d.x);
  const yData = data.map((d) => d.y);

  bench(
    'BarChart with big data amount',
    async () => {
      const { findByText } = render(
        <BarChart xAxis={[{ data: xData }]} series={[{ data: yData }]} width={500} height={300} />,
      );

      await findByText(dataLength.toString(), { ignore: 'span' });

      cleanup();
    },
    options,
  );
});
