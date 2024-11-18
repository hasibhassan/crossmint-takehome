import { sleep } from '../utils/sleep'
import {
  Cometh,
  ComethDirection,
  fetchGoalMap,
  Polyanet,
  Soloon,
  SoloonColor,
} from './megaverseObjects'

type GoalCell =
  | 'POLYANET'
  | 'UP_COMETH'
  | 'DOWN_COMETH'
  | 'LEFT_COMETH'
  | 'RIGHT_COMETH'
  | `${string}_SOLOON`
  | 'SPACE'

export class MegaverseService {
  private polyanet: Polyanet
  private soloon: Soloon
  private cometh: Cometh

  constructor() {
    this.polyanet = new Polyanet()
    this.soloon = new Soloon()
    this.cometh = new Cometh()
  }

  /**
   * Processes a cell from the goal map
   * @param row - Row index
   * @param column - Column position
   * @param value - Cell position
   */
  private async processCell(
    row: number,
    column: number,
    value: GoalCell
  ): Promise<void> {
    try {
      if (value === 'POLYANET') {
        await this.polyanet.createAt(row, column)
      } else if (value.endsWith('_COMETH')) {
        const direction = value.split('_')[0].toLowerCase() as ComethDirection
        await this.cometh.createAt(row, column, direction)
      } else if (value.endsWith('_SOLOON')) {
        const color = value.split('_')[0].toLowerCase() as SoloonColor
        await this.soloon.createAt(row, column, color)
      }
    } catch (e) {
      console.error(`Failed to process ${value} at (${row}, ${column}):`, e)
    }
  }

  // Creates megaverse based on the goal map. Processes in batches to avoid hitting api rate limits
  public async createMegaverse(): Promise<void> {
    try {
      const goalMap = await fetchGoalMap()
      const batchSize = 3 // Num cells to process per batch
      const batchDelay = 3000 // Delay between batches in ms

      // Flatten the goal map into a list of tasks
      const tasks: { row: number; column: number; value: GoalCell }[] = []

      for (let row = 0; row < goalMap.length; row++) {
        for (let column = 0; column < goalMap[row].length; column++) {
          const value = goalMap[row][column] as GoalCell

          if (value !== 'SPACE') {
            tasks.push({ row, column, value })
          }
        }
      }

      // Process tasks in batches
      for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize) // Get a batch

        await Promise.all(
          batch.map(async (task) => {
            await this.processCell(task.row, task.column, task.value)
          })
        )

        console.log(`Batch ${i / batchSize + 1} processed`)
        if (i + batchSize < tasks.length) {
          await sleep(batchDelay) // Delay before processing the next batch
        }
      }

      console.log('Created megaverse successfully')
    } catch (error) {
      console.error('Failed to create megaverse:', error)
    }
  }
}
