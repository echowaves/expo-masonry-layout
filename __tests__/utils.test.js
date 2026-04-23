/* eslint-env jest */
import { calculateColumnMasonryLayout, calculateRowMasonryLayout, sliceIntoBands } from '../src/utils'

describe('inline expand layout behavior', () => {
  const spacing = 8
  const screenWidth = 360
  const numColumns = 3

  const data = [
    { id: 'a', width: 120, height: 200 },
    { id: 'b', width: 200, height: 100 },
    { id: 'c', width: 100, height: 180 },
    { id: 'd', width: 160, height: 160 }
  ]

  test('ignores unmatched expanded ids', () => {
    const collapsed = calculateColumnMasonryLayout(data, screenWidth, numColumns, spacing)
    const withUnmatched = calculateColumnMasonryLayout(
      data,
      screenWidth,
      numColumns,
      spacing,
      undefined,
      undefined,
      ['missing-id'],
      () => 420
    )

    expect(withUnmatched.items).toEqual(collapsed.items)
    expect(withUnmatched.totalHeight).toBe(collapsed.totalHeight)
  })

  test('flushes to waterline and uses expanded height', () => {
    const getExpandedHeight = () => 500
    const result = calculateColumnMasonryLayout(
      data,
      screenWidth,
      numColumns,
      spacing,
      undefined,
      undefined,
      ['c'],
      getExpandedHeight
    )

    const itemC = result.items.find((item) => item.id === 'c')
    expect(itemC).toBeDefined()
    expect(itemC?.isExpanded).toBe(true)
    expect(itemC?.columnIndex).toBe(-1)
    expect(itemC?.left).toBe(spacing)
    expect(itemC?.width).toBe(screenWidth - spacing * 2)

    const precedingItems = result.items.filter((item) => item.masonryIndex < (itemC?.masonryIndex ?? 0))
    const expectedWaterline = Math.max(
      ...precedingItems.map((item) => item.top + item.height + spacing),
      0
    )

    expect(itemC?.top).toBe(expectedWaterline)
    expect(itemC?.height).toBe(500)
  })

  test('does not apply getExtraHeight to expanded items', () => {
    const getExtraHeight = () => 111
    const getExpandedHeight = () => 444

    const result = calculateColumnMasonryLayout(
      data,
      screenWidth,
      numColumns,
      spacing,
      undefined,
      getExtraHeight,
      ['b'],
      getExpandedHeight
    )

    const expanded = result.items.find((item) => item.id === 'b')
    const normal = result.items.find((item) => item.id === 'a')

    expect(expanded?.isExpanded).toBe(true)
    expect(expanded?.extraHeight).toBe(0)
    expect(expanded?.height).toBe(444)

    expect(normal?.isExpanded).toBe(false)
    expect(normal?.extraHeight).toBe(111)
  })

  test('places expanded items in dedicated bands', () => {
    const getExpandedHeight = () => 320
    const { items, totalHeight } = calculateColumnMasonryLayout(
      data,
      screenWidth,
      numColumns,
      spacing,
      undefined,
      undefined,
      ['b', 'd'],
      getExpandedHeight
    )

    const bands = sliceIntoBands(items, totalHeight)
    const expandedBands = bands.filter((band) => band.items.length === 1 && band.items[0].isExpanded)

    expect(expandedBands).toHaveLength(2)
    expandedBands.forEach((band) => {
      expect(band.height).toBe(band.items[0].height)
    })
  })

  test('row layout path remains unchanged by expansion props', () => {
    const rows = calculateRowMasonryLayout(data, screenWidth, spacing)
    expect(rows.rows.length).toBeGreaterThan(0)
    rows.rows.forEach((row) => {
      row.items.forEach((item) => {
        expect(item.extraHeight).toBe(0)
      })
    })
  })
})
