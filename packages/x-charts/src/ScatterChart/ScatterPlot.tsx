'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { Scatter, ScatterProps, ScatterSlotProps, ScatterSlots } from './Scatter';
import { useScatterSeriesContext } from '../hooks/useScatterSeries';
import { useXAxes, useYAxes } from '../hooks';
import { useZAxes } from '../hooks/useZAxis';
import { seriesConfig as scatterSeriesConfig } from './seriesConfig';

export interface ScatterPlotSlots extends ScatterSlots {
  scatter?: React.JSXElementConstructor<ScatterProps>;
}

export interface ScatterPlotSlotProps extends ScatterSlotProps {
  scatter?: Partial<ScatterProps>;
}

export interface ScatterPlotProps extends Pick<ScatterProps, 'onItemClick'> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: ScatterPlotSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: ScatterPlotSlotProps;
}

/**
 * Demos:
 *
 * - [Scatter](https://mui.com/x/react-charts/scatter/)
 * - [Scatter demonstration](https://mui.com/x/react-charts/scatter-demo/)
 *
 * API:
 *
 * - [ScatterPlot API](https://mui.com/x/api/charts/scatter-plot/)
 */
function ScatterPlot(props: ScatterPlotProps) {
  const { slots, slotProps, onItemClick } = props;
  const seriesData = useScatterSeriesContext();
  const { xAxis, xAxisIds } = useXAxes();
  const { yAxis, yAxisIds } = useYAxes();
  const { zAxis, zAxisIds } = useZAxes();

  if (seriesData === undefined) {
    return null;
  }

  const { series, seriesOrder } = seriesData;
  const defaultXAxisId = xAxisIds[0];
  const defaultYAxisId = yAxisIds[0];
  const defaultZAxisId = zAxisIds[0];

  const ScatterItems = slots?.scatter ?? Scatter;

  return (
    <React.Fragment>
      {seriesOrder.map((seriesId) => {
        const { id, xAxisId, yAxisId, zAxisId, color } = series[seriesId];

        const colorGetter = scatterSeriesConfig.colorProcessor(
          series[seriesId],
          xAxis[xAxisId ?? defaultXAxisId],
          yAxis[yAxisId ?? defaultYAxisId],
          zAxis[zAxisId ?? defaultZAxisId],
        );
        const xScale = xAxis[xAxisId ?? defaultXAxisId].scale;
        const yScale = yAxis[yAxisId ?? defaultYAxisId].scale;
        return (
          <ScatterItems
            key={id}
            xScale={xScale}
            yScale={yScale}
            color={color}
            colorGetter={colorGetter}
            series={series[seriesId]}
            onItemClick={onItemClick}
            slots={slots}
            slotProps={slotProps}
            {...slotProps?.scatter}
          />
        );
      })}
    </React.Fragment>
  );
}

ScatterPlot.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Callback fired when clicking on a scatter item.
   * @param {MouseEvent} event Mouse event recorded on the `<svg/>` element.
   * @param {ScatterItemIdentifier} scatterItemIdentifier The scatter item identifier.
   */
  onItemClick: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
} as any;

export { ScatterPlot };
