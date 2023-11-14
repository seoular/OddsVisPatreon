import "./styles.css";
import React, { useState, useEffect } from "react";

function calculateMeanAndStdDev(data) {
  // Extract the values in the 1st index of each list
  const values = data.map((item) => item[1]);

  // Calculate mean
  const meanValue = values.reduce((acc, val) => acc + val, 0) / values.length;

  // Calculate standard deviation
  const squaredDifferences = values.map((val) => Math.pow(val - meanValue, 2));
  const variance =
    squaredDifferences.reduce((acc, val) => acc + val, 0) / values.length;
  const stddevValue = Math.sqrt(variance);

  return { meanValue, stddevValue };
}

function calculatePercentile(mean, stddev, value) {
  // Calculate z-score
  const zScore = (value - mean) / stddev;

  // Use the error function (erf) to calculate the cumulative distribution function (CDF)
  const erf = (z) => {
    const t = 1.0 / (1.0 + 0.5 * Math.abs(z));
    const erf =
      t *
      Math.exp(
        -z * z -
          1.26551223 +
          t *
            (1.00002368 +
              t *
                (0.37409196 +
                  t *
                    (0.09678418 +
                      t *
                        (-0.18628806 +
                          t *
                            (0.27886807 +
                              t *
                                (-1.13520398 +
                                  t *
                                    (1.48851587 +
                                      t * (-0.82215223 + t * 0.17087277))))))))
      );
    return z >= 0 ? 1 - erf : erf - 1;
  };

  // Calculate percentile
  const percentile = (1 + erf(zScore / Math.sqrt(2))) / 2;

  return percentile;
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rainbow(p) {
  var rgb = HSVtoRGB((p / 100.0) * 0.85, 1.0, 1.0);
  return "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
}

export default function SangTable(props) {
  const [visList, setVisList] = useState([]);

  // console.log(props.espnPlayerMap)
  const mapNewVisList = (list, espnPlayerMap) => {
    let meanAndStdDev;
    // if(list.length < 50){
    //   meanAndStdDev =  calculateMeanAndStdDev(list.slice(0, 23));
    // } else{
      meanAndStdDev =  calculateMeanAndStdDev(list);

    // }


    let mean = meanAndStdDev.meanValue;
    let stdDev = meanAndStdDev.stddevValue;

    setVisList(
      list.map((d) => {
        let percentile = calculatePercentile(mean, stdDev, d[1]) * 100;

        return {
          playerName: d[0],
          playerEV: d[1],
          calculatedColor: rainbow(100 - percentile),
          espnValues: espnPlayerMap.get(d[0])
        };
      })
    );
  };
  useEffect(() => {
    mapNewVisList(props.evList, props.espnPlayerMap);
  }, [props.evList]);
  return (
    <div className="SangTable">
      <table style={{}}>
        <tr>
          <th
            style={{
              width: "20px"
            }}
          >
          </th>
          <th
            style={{
              width: "500px"
            }}
          >
            Player {props.position}
          </th>
          <th
            style={{
              width: "46px"
            }}
          >
            EV
          </th>
          {/* <th
            style={{
              width: "46px"
            }}
          >
            ESPN actual
          </th>
          <th
            style={{
              width: "46px"
            }}
          >
            ESPN proj
          </th> */}
        </tr>
        {visList.map((x, ix) => (
          <tr>
            <td 
            style={{
              backgroundColor: x.calculatedColor,
              color: "white",
              border: "1px solid " + x.calculatedColor,
              borderRadius: "10px",
              whiteSpace: "nowrap",              
              fontSize: ".5rem"
            }}>
              {ix+1}
            </td>
            <td
              style={{
                backgroundColor: x.calculatedColor,
                color: "white",
                border: "1px solid " + x.calculatedColor,
                borderRadius: "10px",
                whiteSpace: "nowrap",
                textAlign: "left"
              }}
            >
              {
                <div
                  style={{
                    marginLeft: (1 / x.playerEV.toFixed(2)) * 2000 - 80 + "px"
                  }}
                >
                  {x.playerName}
                </div>
              }
            </td>
            <td
              style={{
                backgroundColor: x.calculatedColor,
                color: "white",
                border: "1px solid " + x.calculatedColor,
                borderRadius: "10px",
                width: "100px"
              }}
            >
              {<div>{x.playerEV.toFixed(2)}</div>}
            </td>
            {/* <td
              style={{
                backgroundColor: x.calculatedColor,
                color: "white",
                border: "1px solid " + x.calculatedColor,
                borderRadius: "10px",
                width: "100px"
              }}
            >
              {<div>{x.espnValues?.act}</div>}
            </td>
            <td
              style={{
                backgroundColor: x.calculatedColor,
                color: "white",
                border: "1px solid " + x.calculatedColor,
                borderRadius: "10px",
                width: "100px"
              }}
            >
              {<div>{x.espnValues?.proj}</div>}
            </td> */}
          </tr>
        ))}
      </table>
    </div>
  );
}
