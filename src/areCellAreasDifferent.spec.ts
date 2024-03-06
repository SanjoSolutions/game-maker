import { areCellAreasDifferent } from "./areCellAreasDifferent.js"
describe("areCellAreasDifferent", () => {
  it("returns true when the cell areas are different", () => {
    expect(
      areCellAreasDifferent(
        { row: 0, column: 0, width: 1, height: 1 },
        { row: 1, column: 0, width: 1, height: 1 },
      ),
    ).toBe(true)
  })

  it("returns false when the cell areas are the same", () => {
    expect(
      areCellAreasDifferent(
        { row: 0, column: 0, width: 1, height: 1 },
        { row: 0, column: 0, width: 1, height: 1 },
      ),
    ).toBe(false)
  })
})
