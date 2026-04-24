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

describe('natural band boundary behavior', () => {
  const spacing = 5

  function makeItem(id, top, height, columnIndex = 0) {
    return {
      id,
      width: 120,
      height,
      masonryIndex: 0,
      aspectRatio: 1,
      left: spacing + columnIndex * (120 + spacing),
      top,
      extraHeight: 0,
      columnIndex,
      isExpanded: false
    }
  }

  test('no item straddles a band boundary', () => {
    // Items in 3 columns with varying heights — boundaries must avoid cutting through any
    const items = [
      makeItem('a', 0, 200, 0),
      makeItem('b', 0, 350, 1),
      makeItem('c', 0, 400, 2),
      makeItem('d', 206, 250, 0),
      makeItem('e', 356, 180, 1),
      makeItem('f', 406, 150, 2)
    ]
    const bands = sliceIntoBands(items, 600)

    for (const band of bands) {
      const bandEnd = band.top + band.height
      for (const item of band.items) {
        // Item must be fully within band
        expect(item.top).toBeGreaterThanOrEqual(band.top)
        expect(item.top + item.height).toBeLessThanOrEqual(bandEnd)
      }
    }
  })

  test('band.top equals sum of preceding band heights (no gaps)', () => {
    const items = [
      makeItem('a', 0, 200, 0),
      makeItem('b', 0, 350, 1),
      makeItem('c', 0, 400, 2),
      makeItem('d', 206, 250, 0),
      makeItem('e', 356, 180, 1),
      makeItem('f', 406, 150, 2)
    ]
    const bands = sliceIntoBands(items, 600)

    let cumulative = 0
    for (const band of bands) {
      expect(band.top).toBe(cumulative)
      cumulative += band.height
    }
  })

  test('items across band boundary appear at correct positions', () => {
    // Two columns: col 0 has items at 0-200 and 205-405, col 1 has items at 0-300 and 305-505
    // Natural boundary should be at 200 or 300 or somewhere all columns are clear
    const items = [
      makeItem('a', 0, 200, 0),
      makeItem('b', 0, 300, 1),
      makeItem('c', 205, 200, 0),
      makeItem('d', 305, 200, 1)
    ]
    const bands = sliceIntoBands(items, 505)

    // Find which band has item 'c'
    const bandWithC = bands.find((b) => b.items.some((i) => i.id === 'c'))
    expect(bandWithC).toBeDefined()

    // Item c's local position should be its grid top minus band top
    const itemC = bandWithC.items.find((i) => i.id === 'c')
    expect(itemC.top - bandWithC.top).toBeGreaterThanOrEqual(0)
    expect(itemC.top + itemC.height).toBeLessThanOrEqual(bandWithC.top + bandWithC.height)
  })

  test('fallback when tall item spans entire region', () => {
    // One very tall item in col 0, shorter items in col 1
    const items = [
      makeItem('tall', 0, 800, 0),
      makeItem('b', 0, 200, 1),
      makeItem('c', 205, 200, 1)
    ]
    const bands = sliceIntoBands(items, 800)

    // The tall item must be fully within its band
    const bandWithTall = bands.find((b) => b.items.some((i) => i.id === 'tall'))
    expect(bandWithTall).toBeDefined()
    expect(bandWithTall.height).toBeGreaterThanOrEqual(800)

    // All items accounted for
    const allItems = bands.flatMap((b) => b.items)
    expect(allItems).toHaveLength(3)
  })

  test('natural boundaries work in pre-expansion and post-expansion regions', () => {
    const normalItems = [
      makeItem('a', 0, 200, 0),
      makeItem('b', 0, 350, 1),
      makeItem('c', 900, 200, 0),
      makeItem('d', 900, 150, 1)
    ]
    const expandedItem = {
      ...makeItem('exp', 500, 300, -1),
      isExpanded: true,
      width: 380
    }
    const items = [...normalItems, expandedItem]
    const bands = sliceIntoBands(items, 1200)

    // Expanded item gets its own band
    const expBand = bands.find((b) => b.items.some((i) => i.id === 'exp'))
    expect(expBand).toBeDefined()
    expect(expBand.height).toBe(300)

    // Pre-expansion items: no item straddles boundary
    const preExpBands = bands.filter((b) => b.top < 500 && !b.items.some((i) => i.isExpanded))
    for (const band of preExpBands) {
      const bandEnd = band.top + band.height
      for (const item of band.items) {
        expect(item.top).toBeGreaterThanOrEqual(band.top)
        expect(item.top + item.height).toBeLessThanOrEqual(bandEnd)
      }
    }

    // Post-expansion items: no item straddles boundary
    const postExpBands = bands.filter((b) => b.top >= 800 && !b.items.some((i) => i.isExpanded))
    for (const band of postExpBands) {
      const bandEnd = band.top + band.height
      for (const item of band.items) {
        expect(item.top).toBeGreaterThanOrEqual(band.top)
        expect(item.top + item.height).toBeLessThanOrEqual(bandEnd)
      }
    }

    // No gaps across all bands
    let cumulative = 0
    for (const band of bands) {
      expect(band.top).toBe(cumulative)
      cumulative += band.height
    }
  })

  test('all items fit within default band when heights are small', () => {
    const items = [
      makeItem('a', 0, 100, 0),
      makeItem('b', 0, 150, 1),
      makeItem('c', 0, 80, 2)
    ]
    const bands = sliceIntoBands(items, 150)
    expect(bands).toHaveLength(1)
    expect(bands[0].height).toBe(150)
    expect(bands[0].top).toBe(0)
  })
})
