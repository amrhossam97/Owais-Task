import { BadRequestException } from "@nestjs/common";
import * as moment from "moment";

export class DateChecker {
  static checkDate(date) {
    if (moment(date.value, "DD-MM-YYYY", true).isValid()) return date.value;
    if (!moment(date.value, "YYYY-MM-DD", true).isValid()) return null;
    const momentVariable = moment(date.value, "YYYY-MM-DD");
    const stringvalue = momentVariable.format("DD-MM-YYYY");
    if (stringvalue === "Invalid date") return null;
    return stringvalue;
  }

  static checkExpiryDate(date) {
    const momentVariable = moment(date.value, "YY-MM");
    if(momentVariable.isBefore(moment())) throw new BadRequestException('Please Insert Valid Expiry Date')
    const stringvalue = momentVariable.format("YY-MM");
    if (stringvalue === "Invalid date") return null;
    return stringvalue;
  }
}
