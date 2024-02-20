import { db } from "@/db/db";
import {
  DBPoolData,
  DBPoolDayData,
  dbPoolData,
  dbPoolDayData,
} from "@/db/schema";
import dayjs from "dayjs";
import { now } from "./utils";

async function insertHourlyPoolData(items: DBPoolData[]) {
  try {
    await db.insert(dbPoolData).values(items);
    const now = dayjs().format("YYYY-MM-DDTHH:mm:ss");
    console.log(`${now} inserted hourly pool data: ${items.length}`);
  } catch (err) {
    console.log("insertHourlyPoolData:", err);
  }
}

async function insertDailyPoolData(items: DBPoolDayData[]) {
  try {
    await db.insert(dbPoolDayData).values(items);
    const now = dayjs().format("YYYY-MM-DDTHH:mm:ss");
    console.log(`${now} inserted daily pool data: ${items.length}`);
  } catch (err) {
    console.log(`${now()} insertDailyPoolData:`, err);
  }
}

export { insertHourlyPoolData, insertDailyPoolData };
