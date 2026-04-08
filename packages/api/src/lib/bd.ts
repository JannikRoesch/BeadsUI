import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface BdOptions {
  workspace?: string
  timeoutMs?: number
}

export class BdError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number | null,
    public readonly stderr: string,
  ) {
    super(message)
    this.name = 'BdError'
  }
}

const DEFAULT_WORKSPACE = process.env['BEADS_WORKSPACE'] ?? process.cwd()
const DEFAULT_TIMEOUT_MS = 15_000

/**
 * Run a bd CLI command and return parsed JSON output.
 * All commands are run with --json for structured output.
 */
export async function bd<T = unknown>(
  args: string[],
  options: BdOptions = {},
): Promise<T> {
  const workspace = options.workspace ?? DEFAULT_WORKSPACE
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const allArgs = [...args, '--json']

  try {
    const { stdout, stderr } = await execFileAsync('bd', allArgs, {
      cwd: workspace,
      timeout: timeoutMs,
      env: { ...process.env, BEADS_WORKSPACE: workspace },
    })

    if (!stdout.trim()) {
      return [] as T
    }

    return JSON.parse(stdout) as T
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      const execErr = err as NodeJS.ErrnoException & {
        stdout?: string
        stderr?: string
        code?: number | string
      }

      const stderr = execErr.stderr ?? ''
      const exitCode = typeof execErr.code === 'number' ? execErr.code : null

      // bd exits non-zero for empty results in some commands — treat as empty array
      if (exitCode === 1 && stderr.includes('No issues found')) {
        return [] as T
      }

      // Try to parse stdout anyway (some bd errors still emit valid JSON)
      if (execErr.stdout?.trim()) {
        try {
          return JSON.parse(execErr.stdout) as T
        } catch {
          // fall through to error
        }
      }

      throw new BdError(
        `bd ${args.join(' ')} failed: ${stderr || 'unknown error'}`,
        exitCode,
        stderr,
      )
    }
    throw err
  }
}

/**
 * Run a bd command that returns a single result object (not array).
 */
export async function bdOne<T = unknown>(
  args: string[],
  options: BdOptions = {},
): Promise<T> {
  const result = await bd<T | T[]>(args, options)
  if (Array.isArray(result)) {
    const first = result[0]
    if (first === undefined) throw new BdError(`bd ${args.join(' ')} returned empty result`, null, '')
    return first
  }
  return result
}

/**
 * Run a bd command that returns raw string output (no --json).
 */
export async function bdRaw(
  args: string[],
  options: BdOptions = {},
): Promise<string> {
  const workspace = options.workspace ?? DEFAULT_WORKSPACE
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  try {
    const { stdout } = await execFileAsync('bd', args, {
      cwd: workspace,
      timeout: timeoutMs,
      env: { ...process.env, BEADS_WORKSPACE: workspace },
    })
    return stdout
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'stderr' in err) {
      const execErr = err as { stderr?: string; code?: number }
      throw new BdError(
        `bd ${args.join(' ')} failed`,
        execErr.code ?? null,
        execErr.stderr ?? '',
      )
    }
    throw err
  }
}
