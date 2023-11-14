import "./styles.css";
import React, { useState, useEffect } from "react";
import { PlayerPosMap } from "./constants";
import SangTable from "./SangTable";

const slotcodes = {
  0: 'QB',   // Quarterback
  2: 'RB',   // Running Back
  4: 'WR',   // Wide Receiver
  16: 'DST',  // Defense/Special Teams
  6: 'TE',
  23: 'FLEX',
  17: 'K',
  20: 'BENCH'

  // Add more mappings as needed based on your specific data structure
};

function TotalContainer() {
  const [selectedPosition, setSelectedPosition] = useState(0);
  const [playerList, setPlayerList] = useState([]);
  const [playerMap, setPlayerMap] = useState(new Map())

  const scrapeEspnStats = async () => {
    const getUrl =
      "https://raw.githubusercontent.com/seoular/test/main/actualESPNStats.json";
    

    await fetch(getUrl)
      .then((response) => {
        return response.json();
      })
      .then((r) => {
        // Assuming 'r' is the response object from a fetch operation in JavaScript
        // Replace 'week' with the actual value you're using for week

        let data = [];

        // Assuming 'slotcodes' is defined somewhere in your code
        // If not, you should define it with appropriate values
        // Example: const slotcodes = { 0: 'QB', 1: 'RB', 2: 'WR', ... };

        const d = r; // Assuming you are using this in an async function

        for (const tm of d.teams) {
          const tmid = tm.id;
          for (const p of tm.roster.entries) {
            const name = p.playerPoolEntry.player.fullName;
            const slot = p.lineupSlotId;
            const pos = slotcodes[slot];

            // Injured status (need try/catch because of D/ST)
            let inj = "NA";
            try {
              inj = p.playerPoolEntry.player.injuryStatus;
            } catch (error) {
              // Do nothing, leave 'NA' as the default value for injured status
            }

            // Projected/actual points
            let proj = null,
              act = null;

            let week = 10;

            for (const stat of p.playerPoolEntry.player.stats) {
              if (stat.scoringPeriodId !== week) {
                continue;
              }
              if (stat.statSourceId === 0) {
                act = stat.appliedTotal;
              } else if (stat.statSourceId === 1) {
                proj = stat.appliedTotal;
              }
            }

            data.push([week, tmid, name, slot, pos, inj, proj, act]);
            playerMap.set(name, {
              proj: proj?.toFixed(2),
              act: act?.toFixed(2)
            });
          }
        }

        // console.log("\nComplete.");

        // // Assuming you are using this in a browser environment with access to the console
        // console.table(data); // Display data in a tabular format in the console
      });
    setPlayerMap(playerMap)
  };

  const scrapeData = async (pos) => {
    const sangPProps = new Map();
    var getUrl = "https://raw.githubusercontent.com/seoular/test/main/sangtest";
    await fetch(getUrl)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let allNflGames = data[0].events.slice();

        for (let i = 0; i < allNflGames.length; i++) {
          let eachGameTDOutcomes = allNflGames[i].displayGroups
            .find((x) => x.id == "100-1870")
            ?.markets.find(
              (y) =>
                y.descriptionKey == "Anytime Touchdown Scorer" &&
                y.period.id == "119"
            )?.outcomes;
          let eachGameRushingOutcomes = allNflGames[i].displayGroups
            .find((x) => x.id == "100-93")
            ?.markets.filter((y) => y.marketTypeId == "121337");
          let eachGameReceivingOutcomes = allNflGames[i].displayGroups
            .find((x) => x.id == "100-94")
            ?.markets.filter((y) => y.marketTypeId == "121333");
          let eachGameReceptionOutcomes = allNflGames[i].displayGroups
            .find((x) => x.id == "100-94")
            ?.markets.filter((y) => y.marketTypeId == "121332");
          let eachGamePassingYdOutcomes = allNflGames[i].displayGroups
            .find((x) => x.id == "100-1188")
            ?.markets.filter((y) => y.marketTypeId == "121348");
          let eachGamePassingTDOutcomes = allNflGames[i].displayGroups
            .find((x) => x.id == "100-1188")
            ?.markets.filter((y) => y.marketTypeId == "121335");
          let eachGameIntOutcomes = allNflGames[i].displayGroups
            .find((x) => x.id == "100-1188")
            ?.markets.filter((y) => y.marketTypeId == "121329");
          if (typeof eachGameTDOutcomes !== "undefined") {
            for (let j = 0; j < eachGameTDOutcomes.length; j++) {
              let playerOdds = eachGameTDOutcomes[j];
              // get formula right later
              sangPProps.set(
                playerOdds.description,
                (1 / playerOdds.price.decimal) * 6
              );
            }
          }
          if (typeof eachGameRushingOutcomes !== "undefined") {
            for (let j = 0; j < eachGameRushingOutcomes.length; j++) {
              let playerOdds = eachGameRushingOutcomes[j];
              let name = playerOdds.description.slice(22);
              let temp = sangPProps.get(name);
              if (typeof temp == "undefined") {
                temp = 0;
              }
              sangPProps.set(
                name,
                temp + playerOdds.outcomes[0].price.handicap / 10
              );
            }
          }
          if (typeof eachGameReceivingOutcomes !== "undefined") {
            for (let j = 0; j < eachGameReceivingOutcomes.length; j++) {
              let playerOdds = eachGameReceivingOutcomes[j];
              let name = playerOdds.description.slice(24);
              let temp = sangPProps.get(name);
              if (typeof temp == "undefined") {
                temp = 0;
              }
              sangPProps.set(
                name,
                temp + playerOdds.outcomes[0].price.handicap / 10
              );
            }
          }
          if (typeof eachGameReceptionOutcomes !== "undefined") {
            for (let j = 0; j < eachGameReceptionOutcomes.length; j++) {
              let playerOdds = eachGameReceptionOutcomes[j];
              let name = playerOdds.description.slice(19);
              let temp = sangPProps.get(name);
              if (typeof temp == "undefined") {
                temp = 0;
              }
              sangPProps.set(
                name,
                temp + playerOdds.outcomes[0].price.handicap * 0.5
              );
            }
          }
          if (typeof eachGamePassingYdOutcomes !== "undefined") {
            for (let j = 0; j < eachGamePassingYdOutcomes.length; j++) {
              let playerOdds = eachGamePassingYdOutcomes[j];
              let name = playerOdds.description.slice(22);
              let temp = sangPProps.get(name);
              if (typeof temp == "undefined") {
                temp = 0;
              }
              sangPProps.set(
                name,
                temp + playerOdds.outcomes[0].price.handicap / 25
              );
            }
          }
          if (typeof eachGamePassingTDOutcomes !== "undefined") {
            for (let j = 0; j < eachGamePassingTDOutcomes.length; j++) {
              let playerOdds = eachGamePassingTDOutcomes[j];
              let name = playerOdds.description.slice(27);
              let temp = sangPProps.get(name);
              if (typeof temp == "undefined") {
                temp = 0;
              }
              sangPProps.set(
                name,
                temp + playerOdds.outcomes[0].price.handicap * 4
              );
            }
          }
          if (typeof eachGameIntOutcomes !== "undefined") {
            for (let j = 0; j < eachGameIntOutcomes.length; j++) {
              let playerOdds = eachGameIntOutcomes[j];
              let name = playerOdds.description.slice(29);
              let temp = sangPProps.get(name);
              if (typeof temp == "undefined") {
                temp = 0;
              }
              sangPProps.set(
                name,
                temp + playerOdds.outcomes[0].price.handicap * -2
              );
            }
          }
        }

        const mapEntries = Array.from(sangPProps.entries());
        // Sort the array based on the numeric value (assuming values are numbers)
        mapEntries.sort((a, b) => b[1] - a[1]);
        // Create a new Map from the sorted array
        const sortedMap = new Map(mapEntries);
        let finalList = Array.from(sortedMap.entries()).filter(
          (x) =>
            typeof PlayerPosMap.get(x[0]) !== "undefined" &&
            PlayerPosMap.get(x[0]) == pos &&
            x[1] > 5
        );

        setPlayerList(finalList);

        return finalList;
      });
    // .catch((err) => {
    //   return [];
    //   // Do something for an error here
    // });
  };

  useEffect(() => {
    scrapeEspnStats()
  }, [])
  useEffect(() => {
    scrapeData(selectedPosition).catch(console.error);
  }, [selectedPosition]);

  const myFunction = (e) => {
    const axios = require('axios');

    // Replace these values with your actual client ID, redirect URI, and optional parameters
    const CLIENT_ID = '1e15hQK-KU94SRlMJnihFhutX07VCj4A4rpTxrmp9H_SaRhQPL2zBHmIjOmw_r4r';
    const CLIENT_SECRET = 'CFZCW8qZNwf7y80AV0tmLfq86V2phIT5Tv6D247rDMoDnyhfSd7hHwTQZmWgCJAw'
    const REDIRECT_URI = 'https://www.evProjecter.com/';

    // Construct the URL with the parameters
    const url = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

    // Make the GET request
    axios.get(url)
      .then(response => {
        // Handle the response here
        console.log(response.data);
        const postData = {
          code: response.data,
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
        };
        
        // Make the POST request
        axios.post('https://www.patreon.com/api/oauth2/token', postData)
          .then(response => {
            // Handle the response here
            console.log(response.data);
          })
          .catch(error => {
            // Handle errors here
            console.error(error);
          });
      })
      .catch(error => {
        // Handle errors here
        console.error(error);
      });
  }

  return (
    <div>
      <div>
        <div>
          <button onclick="myFunction()">Click me</button>
          <select
            defaultValue={selectedPosition}
            onChange={(e) => {
              setSelectedPosition(parseInt(e.target.value));
            }}
            style={{ display: "flex", marginLeft: "20px" }}
          >
            <option value="0">QB</option>
            <option value="1">RB</option>
            <option value="2">WR</option>
            <option value="3">TE</option>
          </select>
        </div>
        <SangTable selectedPosition={selectedPosition} evList={playerList} espnPlayerMap={playerMap} />
      </div>
    </div>
  );
}

export default TotalContainer;
