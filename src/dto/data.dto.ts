import { IsPositive} from "class-validator"

export class dataDTO {

  // @IsPositive({ message: 'startBlock is empty!' })
  startBlock: number

  endBlock: number

  address: string

  addressArray: string[]

  url: string

  txHash: string
}
