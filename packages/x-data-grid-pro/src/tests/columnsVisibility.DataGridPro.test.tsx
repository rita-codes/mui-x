import * as React from 'react';
import { spy } from 'sinon';
import { RefObject } from '@mui/x-internals/types';
import { createRenderer, act, screen } from '@mui/internal-test-utils';
import {
  DataGridPro,
  DataGridProProps,
  GridApi,
  gridClasses,
  GridColDef,
  gridColumnVisibilityModelSelector,
  GridPreferencePanelsValue,
  GridRowsProp,
  useGridApiRef,
} from '@mui/x-data-grid-pro';
import { getColumnHeadersTextContent } from 'test/utils/helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rows: GridRowsProp = [{ id: 1 }];

const columns: GridColDef[] = [{ field: 'id' }, { field: 'idBis' }];

describe('<DataGridPro /> - Columns visibility', () => {
  const { render } = createRenderer();

  let apiRef: RefObject<GridApi | null>;

  function TestDataGridPro(
    props: Omit<DataGridProProps, 'columns' | 'rows' | 'apiRef'> &
      Partial<Pick<DataGridProProps, 'rows' | 'columns'>>,
  ) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGridPro
          columns={columns}
          rows={rows}
          {...props}
          apiRef={apiRef}
          autoHeight={isJSDOM}
        />
      </div>
    );
  }

  describe('apiRef: updateColumns', () => {
    it('should not call `onColumnVisibilityModelChange` when no column visibility has changed', () => {
      const onColumnVisibilityModelChange = spy();
      render(
        <TestDataGridPro
          columnVisibilityModel={{ idBis: false }}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        />,
      );

      act(() => apiRef.current?.updateColumns([{ field: 'id', width: 300 }]));
      expect(onColumnVisibilityModelChange.callCount).to.equal(0);
    });
  });

  describe('apiRef: setColumnVisibility', () => {
    it('should update `columnVisibilityModel` in state', () => {
      render(
        <TestDataGridPro initialState={{ columns: { columnVisibilityModel: { idBis: false } } }} />,
      );
      act(() => apiRef.current?.setColumnVisibility('id', false));
      expect(gridColumnVisibilityModelSelector(apiRef)).to.deep.equal({
        id: false,
        idBis: false,
      });

      act(() => apiRef.current?.setColumnVisibility('id', true));
      expect(gridColumnVisibilityModelSelector(apiRef)).to.deep.equal({
        id: true,
        idBis: false,
      });
    });

    it('should call `onColumnVisibilityModelChange` with the new model', () => {
      const onColumnVisibilityModelChange = spy();

      render(
        <TestDataGridPro
          initialState={{ columns: { columnVisibilityModel: { idBis: false } } }}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        />,
      );

      act(() => apiRef.current?.setColumnVisibility('id', false));
      expect(onColumnVisibilityModelChange.callCount).to.equal(1);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
        id: false,
        idBis: false,
      });

      act(() => apiRef.current?.setColumnVisibility('id', true));
      expect(onColumnVisibilityModelChange.callCount).to.equal(2);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
        idBis: false,
        id: true,
      });
    });
  });

  describe('apiRef: setColumnVisibilityModel', () => {
    it('should update `setColumnVisibilityModel` in state and call `onColumnVisibilityModelChange`', () => {
      const onColumnVisibilityModelChange = spy();

      render(
        <TestDataGridPro
          initialState={{ columns: { columnVisibilityModel: { idBis: false } } }}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        />,
      );
      act(() => apiRef.current?.setColumnVisibilityModel({}));
      expect(onColumnVisibilityModelChange.callCount).to.equal(1);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({});
    });
  });

  it('should not hide column when resizing a column after hiding it and showing it again', async () => {
    const { user } = render(
      <TestDataGridPro
        initialState={{
          columns: { columnVisibilityModel: {} },
          preferencePanel: { open: true, openedPanelValue: GridPreferencePanelsValue.columns },
        }}
      />,
    );

    const showHideAllCheckbox = screen.getByRole('checkbox', { name: 'Show/Hide All' });
    await user.click(showHideAllCheckbox);
    expect(getColumnHeadersTextContent()).to.deep.equal([]);
    await user.click(document.querySelector('[role="tooltip"] [name="id"]')!);
    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);

    const separator = document.querySelector(`.${gridClasses['columnSeparator--resizable']}`)!;
    await user.pointer([
      {
        keys: '[MouseLeft>]',
        target: separator,
        coords: { clientX: 100 },
      },
      {
        target: separator,
        coords: { clientX: 110 },
      },
      {
        keys: '[/MouseLeft]',
        target: separator,
        coords: { clientX: 110 },
      },
    ]);

    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
  });
});
