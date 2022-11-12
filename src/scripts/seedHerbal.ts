import fs from "fs";
import path from 'path'
import { parse } from "csv-parse";
import { prismaClient } from '../database/client'

fs.createReadStream(path.join(__dirname, "../data/herbals.csv"))
  .pipe(parse({ delimiter: ",", from_line: 1 }))
  .on("data", async function (row) {
    try {
      await prismaClient.medicine.create({
        data: {
          name: row[1],
          subGroup: row[2],
          pharmaceuticalForm: row[3],
          therapeuticIndication: row[4]
        }
      })
    } catch {
      console.log("erro:", row[0], row[1])
    }
  })
  .on("end", function () {
    console.log("finished");
  })
  .on("error", function (error) {
    console.log(error.message);
  });
