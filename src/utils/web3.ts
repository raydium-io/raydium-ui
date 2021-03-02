import { AccountInfo, Commitment, Connection, PublicKey } from '@solana/web3.js'

import assert from 'assert'
// eslint-disable-next-line
import { struct } from 'superstruct'

// getMultipleAccounts
export async function getMultipleAccounts(
  connection: Connection,
  publicKeys: PublicKey[],
  commitment?: Commitment
): Promise<
  Array<null | { publicKey: PublicKey; account: AccountInfo<Buffer> }>
> {
  const args = [publicKeys.map((k) => k.toBase58()), { commitment }]
  // @ts-ignore
  const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args)
  const res = GetMultipleAccountsAndContextRpcResult(unsafeRes)
  if (res.error) {
    throw new Error(
      'failed to get info about accounts ' +
        publicKeys.map((k) => k.toBase58()).join(', ') +
        ': ' +
        res.error.message
    )
  }
  assert(typeof res.result !== 'undefined')
  const accounts: Array<null | {
    executable: any
    owner: PublicKey
    lamports: any
    data: Buffer
  }> = []
  for (const account of res.result.value) {
    let value: {
      executable: any
      owner: PublicKey
      lamports: any
      data: Buffer
    } | null = null
    if (account === null) {
      accounts.push(null)
      continue
    }
    if (res.result.value) {
      const { executable, owner, lamports, data } = account
      assert(data[1] === 'base64')
      value = {
        executable,
        owner: new PublicKey(owner),
        lamports,
        data: Buffer.from(data[0], 'base64'),
      }
    }
    if (value === null) {
      throw new Error('Invalid response')
    }
    accounts.push(value)
  }
  return accounts.map((account, idx) => {
    if (account === null) {
      return null
    }
    return {
      publicKey: publicKeys[idx],
      account,
    }
  })
}

function jsonRpcResult(resultDescription: any) {
  const jsonRpcVersion = struct.literal('2.0')
  return struct.union([
    struct({
      jsonrpc: jsonRpcVersion,
      id: 'string',
      error: 'any',
    }),
    struct({
      jsonrpc: jsonRpcVersion,
      id: 'string',
      error: 'null?',
      result: resultDescription,
    }),
  ])
}

function jsonRpcResultAndContext(resultDescription: any) {
  return jsonRpcResult({
    context: struct({
      slot: 'number',
    }),
    value: resultDescription,
  })
}

const AccountInfoResult = struct({
  executable: 'boolean',
  owner: 'string',
  lamports: 'number',
  data: 'any',
  rentEpoch: 'number?',
})

const GetMultipleAccountsAndContextRpcResult = jsonRpcResultAndContext(
  struct.array([struct.union(['null', AccountInfoResult])])
)
