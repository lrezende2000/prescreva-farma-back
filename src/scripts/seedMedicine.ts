import fs from "fs";
import path from 'path'
import { parse } from "csv-parse";
import { prismaClient } from '../database/client'

fs.createReadStream(path.join(__dirname, "../data/mips.csv"))
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", async function (row) {
    try {
      await prismaClient.medicine.create({
        data: {
          name: row[1],
          subGroup: row[2],
          pharmaceuticalForm: row[3],
          maximumDosage: row[4],
          therapeuticIndication: row[5]
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
