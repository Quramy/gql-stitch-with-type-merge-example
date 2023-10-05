import { rand, randFullName } from '@ngneat/falso'
import { range } from 'lodash'

export type UserData = {
  readonly id: string
  readonly name: string
}

const users = range(20).map((i) => {
  return {
    id: `user${i}` as string,
    name: randFullName(),
  } as const satisfies UserData
})

export async function getUserById(id: string) {
  return users.find((u) => u.id === id) ?? null
}

export async function getUsersByIds(ids: readonly string[]) {
  return Promise.all(ids.map(getUserById))
}
