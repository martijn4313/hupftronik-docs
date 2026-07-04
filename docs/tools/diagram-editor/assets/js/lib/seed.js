/* ============ demo seed: the fan circuit from the library ============
   loaded through the same path as "Load JSON" so it gets the identical
   normalization (ECU/switch/ignition/note defaults) as a user's file. */

import { applyLoadedData } from './io.js';

const DEMO = {
  "version": 1,
  "comps": [
    {
      "id": 1,
      "type": "battery",
      "des": "BAT1",
      "label": "main battery",
      "value": "12V",
      "r": 0,
      "textOffsets": { "des": { "x": 0, "y": 0 }, "label": { "x": 0, "y": 0 } },
      "pinTextOffsets": {},
      "x": 270,
      "y": 190
    },
    {
      "id": 2,
      "type": "fuse",
      "des": "F1",
      "label": "fan fuse",
      "value": "30A",
      "r": 270,
      "textOffsets": { "des": { "x": 30, "y": 40 }, "label": { "x": 20, "y": -50 }, "value": { "x": 0, "y": 0 } },
      "pinTextOffsets": {},
      "x": 440,
      "y": 20
    },
    {
      "id": 3,
      "type": "relay",
      "des": "K1",
      "label": "cooling fan",
      "value": "",
      "r": 0,
      "textOffsets": { "des": { "x": 0, "y": 0 }, "label": { "x": 0, "y": 0 } },
      "pinTextOffsets": {},
      "x": 500,
      "y": 100
    },
    {
      "id": 4,
      "type": "switch",
      "des": "S1",
      "label": "temp switch 92°C",
      "value": "",
      "r": 0,
      "textOffsets": { "des": { "x": 0, "y": 0 }, "label": { "x": 0, "y": 0 } },
      "pinTextOffsets": {},
      "x": 430,
      "y": 340,
      "on": false
    },
    {
      "id": 5,
      "type": "motor",
      "des": "M1",
      "label": "cooling fan",
      "value": "",
      "r": 0,
      "textOffsets": { "des": { "x": 50, "y": 20 }, "label": { "x": 70, "y": -60 } },
      "pinTextOffsets": {},
      "x": 560,
      "y": 270
    },
    {
      "id": 6,
      "type": "ground",
      "des": "G1",
      "label": "body",
      "value": "",
      "r": 0,
      "textOffsets": { "des": { "x": 0, "y": 50 }, "label": { "x": 0, "y": 0 } },
      "pinTextOffsets": {},
      "x": 570,
      "y": 440
    },
    {
      "id": 20,
      "type": "ground",
      "des": "G3",
      "label": "",
      "value": "",
      "r": 0,
      "textOffsets": { "des": { "x": 0, "y": 50 }, "label": { "x": 0, "y": 0 } },
      "pinTextOffsets": { "g": { "x": -10, "y": 50 } },
      "x": 420,
      "y": 190
    },
    {
      "id": 25,
      "type": "ground",
      "des": "G4",
      "label": "",
      "value": "",
      "r": 0,
      "textOffsets": { "des": { "x": 0, "y": 60 }, "label": { "x": 0, "y": 0 } },
      "pinTextOffsets": {},
      "x": 340,
      "y": 390
    }
  ],
  "wires": [
    { "id": 12, "a": { "comp": 5, "pin": "2" }, "b": { "comp": 6, "pin": "g" }, "color": "BN", "tracer": "", "gauge": "6.0", "lengthMm": "", "wp": [] },
    { "id": 17, "a": { "comp": 1, "pin": "plus" }, "b": { "comp": 2, "pin": "2" }, "color": "RD", "tracer": "", "gauge": "6.0", "lengthMm": "", "wp": [] },
    { "id": 18, "a": { "comp": 5, "pin": "1" }, "b": { "comp": 3, "pin": "87" }, "color": "RD", "tracer": "", "gauge": "6.0", "lengthMm": "", "wp": [] },
    { "id": 19, "a": { "comp": 3, "pin": "30" }, "b": { "comp": 2, "pin": "2" }, "color": "RD", "tracer": "", "gauge": "6.0", "lengthMm": "", "wp": [] },
    { "id": 21, "a": { "comp": 20, "pin": "g" }, "b": { "comp": 1, "pin": "minus" }, "color": "BN", "tracer": "", "gauge": "6.0", "lengthMm": "", "wp": [ { "x": 390, "y": 120 } ] },
    { "id": 23, "a": { "comp": 3, "pin": "86" }, "b": { "comp": 1, "pin": "plus" }, "color": "YE", "tracer": "", "gauge": "0.75", "lengthMm": "", "wp": [ { "x": 390, "y": 80 } ] },
    { "id": 24, "a": { "comp": 4, "pin": "2" }, "b": { "comp": 3, "pin": "85" }, "color": "BU", "tracer": "", "gauge": "0.75", "lengthMm": "", "wp": [] },
    { "id": 26, "a": { "comp": 4, "pin": "1" }, "b": { "comp": 25, "pin": "g" }, "color": "BU", "tracer": "", "gauge": "0.75", "lengthMm": "", "wp": [] }
  ],
  "counters": { "BAT": 1, "F": 2, "K": 1, "S": 1, "M": 1, "G": 4, "T": 2, "Q": 1 },
  "nextId": 30,
  "wireDefaults": { "color": "BN", "tracer": "", "gauge": "1.5", "lengthMm": "" },
  "showWireLabels": true,
  "view": { "x": 48.375480118156524, "y": -106.817746844022, "w": 1123.9424000000004, "h": 640.4932032876715 },
  "cascade": 13
};

export function seed(){
  applyLoadedData(JSON.parse(JSON.stringify(DEMO)));
}
