import { sleep } from '../utils/sleep'

export type SoloonColor = 'blue' | 'red' | 'purple' | 'white'
export type ComethDirection = 'up' | 'down' | 'left' | 'right'

// Base API URL
const BASE_URL = 'https://challenge.crossmint.io/api'
// Candidate ID
const CANDIDATE_ID = process.env.CANDIDATE_ID as string

/**
 * Base class representing an astral object in the megaverse.
 * Provides methods to create and delete objects via the api
 */
class AstralObject {
  protected type: string
  protected candidateId: string
  protected baseUrl: string

  constructor(type: string) {
    this.type = type
    this.candidateId = CANDIDATE_ID
    this.baseUrl = BASE_URL
  }

  /**
   * Create an astral object
   * @param params - Params for api request
   */
  async create(params: Record<string, any>): Promise<void> {
    const url = `${this.baseUrl}/${this.type}`
    const body = {
      candidateId: this.candidateId,
      ...params,
    }
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }

    try {
      const delay = 500 // Base delay in ms
      const retries = 3

      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options)
          if (!response.ok) {
            const errorData = await response.text()
            throw new Error(errorData)
          }
          console.log(`${this.type.slice(0, -1)} created with params:`, params)

          return
        } catch (error: any) {
          if (
            i === retries - 1 ||
            error.reason !== 'Too Many Requests. Try again later.'
          ) {
            throw error
          }
          console.warn(`Rate limited. Retrying in ${delay * 2 ** i}ms...`)
          await sleep(delay * 2 ** i) // Exponential backoff
        }
      }
    } catch (e) {
      console.error(`Failed to create ${this.type.slice(0, -1)}:`, e)
    }
  }

  /**
   * Delete an astral object
   * @param params - Params for api request
   */
  async delete(params: Record<string, any>): Promise<void> {
    const url = `${this.baseUrl}/${this.type}`
    const body = {
      candidateId: this.candidateId,
      ...params,
    }
    const options: RequestInit = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData)
      }

      console.log(`${this.type.slice(0, -1)} deleted with params:`, params)
    } catch (e) {
      console.error(`Failed to delete ${this.type.slice(0, -1)}:`, e)
    }
  }
}

/**
 * Class representing a Polyanet in the Megaverse.
 * Extends AstralObject
 */
export class Polyanet extends AstralObject {
  constructor() {
    super('polyanets')
  }

  /**
   * Create a polyanet at a specific row and column
   * @param row - Row position
   * @param column - Column position
   */
  async createAt(row: number, column: number): Promise<void> {
    await this.create({ row, column })
  }

  /**
   * Delete a Polyanet at a specific row and column
   * @param row - Row position
   * @param column - Column position
   */
  async deleteAt(row: number, column: number): Promise<void> {
    await this.delete({ row, column })
  }
}

/**
 * Class representing a Soloon in the Megaverse.
 * Extends AstralObject
 */
export class Soloon extends AstralObject {
  constructor() {
    super('soloons')
  }

  /**
   * Create a Soloon at a specifiic row and column
   * @param row - Row position
   * @param column - Column position
   * @param color - Soloon color. Of type `SoloonColor`
   */
  async createAt(
    row: number,
    column: number,
    color: SoloonColor
  ): Promise<void> {
    await this.create({ row, column, color })
  }

  /**
   * Delete a Soloon at a specifiic row and column
   * @param row - Row position
   * @param column - Column position
   */
  async deleteAt(row: number, column: number): Promise<void> {
    await this.delete({ row, column })
  }
}

/**
 * Class representing a Cometh in the Megaverse.
 * Extends AstralObject
 */
export class Cometh extends AstralObject {
  constructor() {
    super('comeths')
  }

  /**
   * Create a Cometh at a specific row and column
   * @param row - Row position
   * @param column - Column position
   * @param direction  - Cometh direction
   */
  async createAt(
    row: number,
    column: number,
    direction: ComethDirection
  ): Promise<void> {
    await this.create({ row, column, direction })
  }

  /**
   * Delete a Cometh at a specific row and column
   * @param row - Row position
   * @param column - Column position
   */
  async deleteAt(row: number, column: number): Promise<void> {
    await this.delete({ row, column })
  }
}

/**
 * Fetches the goal map from the api
 * @returns Goal map grid
 */
export async function fetchGoalMap(): Promise<string[][]> {
  const url = `${BASE_URL}/map/${CANDIDATE_ID}/goal`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(errorData)
    }

    const data = await response.json()
    if (!data.goal || !Array.isArray(data.goal)) {
      throw new Error('Invalid goal map structure.')
    }

    console.log('successfully fetched goal map')
    return data.goal
  } catch (error) {
    console.error('Failed to fetch goal map:', error)
    throw error
  }
}
