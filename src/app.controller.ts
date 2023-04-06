import {Controller, Post, Query} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger'
import { AppService } from './app.service';
import {dataDTO} from "./dto/data.dto";

@ApiTags('data')
@Controller('data')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('example')
  async example(@Query() param: dataDTO) {
    return await this.appService.example(param);
  }
}
