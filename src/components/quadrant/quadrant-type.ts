export enum QuadrantType {
  /** The main quadrant beneath any frozen rows or columns. */
  MAIN = 'main',
  /** The top quadrant, containing column headers and frozen rows. */
  TOP = 'top',
  /** The left quadrant, containing row headers and frozen columns. */
  LEFT = 'left',
  /** The top-left quadrant, containing the headers and cells common to both the frozen columns and frozen rows. */
  TOP_LEFT = 'top-left',
}
