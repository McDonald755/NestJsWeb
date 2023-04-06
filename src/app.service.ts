import { Injectable } from '@nestjs/common';
import {dataDTO} from "./dto/data.dto";

@Injectable()
export class AppService {
  async example(param: dataDTO) {
    return '';
  }
}
