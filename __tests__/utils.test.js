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

describe('adaptive band height behavior', () => {
  const spacing = 5
  const screenWidth = 390
  const numColumns = 3

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

  test('band height stays at 300 when all items fit within default height', () => {
    const items = [
      makeItem('a', 0, 150, 0),
      makeItem('b', 0, 200, 1),
      makeItem('c', 0, 100, 2)
    ]
    const bands = sliceIntoBands(items, 300)
    expect(bands).toHaveLength(1)
    expect(bands[0].height).toBe(300)
  })

  test('band height expands when an item extends past 300px boundary', () => {
    const items = [
      makeItem('a', 0, 100, 0),
      makeItem('b', 250, 219, 1)
    ]
    const bands = sliceIntoBands(items, 469)
    // Both items assigned to band 0 (top edge < 300)
    const band0 = bands[0]
    expect(band0.items).toHaveLength(2)
    expect(band0.height).toBe(469) // 250 + 219
  })

  test('band height uses largest overflow when multiple items overflow', () => {
    const items = [
      makeItem('a', 200, 219, 0), // bottom = 419
      makeItem('b', 250, 219, 1), // bottom = 469
      makeItem('c', 100, 100, 2)  // bottom = 200, fits
    ]
    const bands = sliceIntoBands(items, 469)
    const band0 = bands[0]
    expect(band0.items).toHaveLength(3)
    expect(band0.height).toBe(469) // max(300, 419, 469, 200) = 469
  })

  test('empty band retains default height of 300', () => {
    // Create items that only land in band 1 (top >= 300)
    const items = [
      makeItem('a', 310, 100, 0)
    ]
    const bands = sliceIntoBands(items, 500)
    // Band 0 should exist but be empty
    expect(bands[0].items).toHaveLength(0)
    expect(bands[0].height).toBe(300)
    // Band 1 should contain the item
    expect(bands[1].items).toHaveLength(1)
  })

  test('adaptive height works in bands before and after expanded items', () => {
    const normalItems = [
      makeItem('a', 200, 250, 0), // pre-expansion band, overflows: 200+250=450
      makeItem('b', 900, 219, 1)  // post-expansion band, overflows: (900-800)+219=319 > 300
    ]
    const expandedItem = {
      ...makeItem('exp', 500, 300, -1),
      isExpanded: true,
      width: 380
    }
    const items = [...normalItems, expandedItem]
    const bands = sliceIntoBands(items, 1200)

    // Find the pre-expansion band containing item 'a'
    const preExpBand = bands.find((b) => b.items.some((i) => i.id === 'a'))
    expect(preExpBand).toBeDefined()
    expect(preExpBand.height).toBe(450) // 200 + 250

    // Find the expansion band
    const expBand = bands.find((b) => b.items.some((i) => i.id === 'exp'))
    expect(expBand).toBeDefined()
    expect(expBand.height).toBe(300) // expanded item's own height

    // Find the post-expansion band containing item 'b'
    const postExpBand = bands.find((b) => b.items.some((i) => i.id === 'b'))
    expect(postExpBand).toBeDefined()
    // item 'b' top=900, band starts at 800, so local top = 100, height 219, bottom = 319 > 300
    expect(postExpBand.height).toBe(319)
  })
})

describe('cumulative band top coordinates', () => {
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

  test('band tops are cumulative after adaptive expansion', () => {
    // Band 0 has an item that overflows: top=0, height=450 → band height expands to 450
    // Band 1 should start at cumulative top = 450
    const items = [
      makeItem('a', 0, 450, 0),
      makeItem('b', 310, 100, 1)
    ]
    const bands = sliceIntoBands(items, 600)
    expect(bands[0].height).toBe(450)
    expect(bands[0].top).toBe(0)
    expect(bands[1].top).toBe(450)
  })

  test('contentTop preserves original grid-coordinate position', () => {
    const items = [
      makeItem('a', 0, 450, 0),
      makeItem('b', 310, 100, 1)
    ]
    const bands = sliceIntoBands(items, 600)
    // Band 0 grid origin is 0
    expect(bands[0].contentTop).toBe(0)
    // Band 1 grid origin is 300 (fixed grid interval)
    expect(bands[1].contentTop).toBe(300)
    // But band 1 cumulative top is 450 (after band 0 expanded)
    expect(bands[1].top).toBe(450)
  })

  test('no gaps — each band.top equals sum of preceding band heights', () => {
    // Band 0: item overflows to 450. Band 1: item overflows to 350.
    const items = [
      makeItem('a', 0, 450, 0),
      makeItem('b', 300, 350, 1),
      makeItem('c', 610, 100, 2)
    ]
    const bands = sliceIntoBands(items, 900)
    // Verify cumulative: band[i].top === sum of band[0..i-1].height
    let cumulative = 0
    for (const band of bands) {
      expect(band.top).toBe(cumulative)
      cumulative += band.height
    }
  })

  test('bands with no expansion have top === contentTop', () => {
    // All items fit within default 300px bands
    const items = [
      makeItem('a', 0, 150, 0),
      makeItem('b', 0, 200, 1),
      makeItem('c', 300, 100, 0),
      makeItem('d', 300, 250, 1)
    ]
    const bands = sliceIntoBands(items, 600)
    for (const band of bands) {
      expect(band.top).toBe(band.contentTop)
    }
  })
})
