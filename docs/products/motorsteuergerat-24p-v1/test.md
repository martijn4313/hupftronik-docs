%%{init: {"theme":"base","themeVariables":{"primaryColor":"#f5f5f5","primaryBorderColor":"#616161","primaryTextColor":"#000000","lineColor":"#9e9e9e","edgeLabelBackground":"#ffffff","clusterBkg":"#fdf6ec","clusterBorder":"#8d6e63","titleColor":"#000000","fontSize":"14px"}}}%%
````mermaid
flowchart LR
classDef power fill:#fff3c4,stroke:#b8860b,stroke-width:2px,color:#000
classDef battery fill:#263238,stroke:#f9a825,stroke-width:2.5px,color:#ffd600
classDef fuse fill:#ffe3e3,stroke:#c62828,stroke-width:2px,color:#000
classDef switch fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
classDef load fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
classDef ground fill:#eceff1,stroke:#37474f,stroke-width:2px,color:#000
classDef relay fill:#fdf6ec,stroke:#8d6e63,stroke-width:2px,color:#000
classDef conn fill:#f3e5f5,stroke:#6a1b9a,stroke-width:1.5px,color:#000
classDef module fill:#ede7f6,stroke:#4527a0,stroke-width:2px,color:#000
classDef pinCoil fill:#fff8e1,stroke:#ef6c00,stroke-width:1.5px,color:#000
classDef pinCom fill:#eceff1,stroke:#37474f,stroke-width:1.5px,color:#000
classDef pinNO fill:#e8f5e9,stroke:#2e7d32,stroke-width:1.5px,color:#000
classDef pinNC fill:#ffebee,stroke:#c62828,stroke-width:1.5px,color:#000
subgraph K1["K1 — cooling fan relay (SPST)"]
  direction TB
  K1_86(("86")):::pinCoil
  K1_85(("85")):::pinCoil
  K1_30(("30")):::pinCom
  K1_87(("87")):::pinNO
  K1_86 -.- K1_85
  K1_30 === K1_87
end
class K1 relay
BAT1[("🔋 BAT1 12V")]:::battery
F1{{"F1 50A"}}:::fuse
M1(("M<br/>cooling fan")):::load
G1[\"⏚ G1 body"/]:::ground
G2[\"⏚ G2 engine"/]:::ground
A1["A1 ECU<br/>pin 27"]:::module
F2{{"F2 1A"}}:::fuse
BAT1 ---|6.0mm² RD| F1
F1 ---|6.0mm² RD/BU| K1_30
K1_87 ---|6.0mm² BU| M1
M1 ---|6.0mm² BN| G1
A1 ---|0.75mm² RD| K1_85
F2 ---|0.75mm² BK| K1_86
BAT1 ---|6.0mm² BK| G2
F2 ---|0.75mm² VT| BAT1
linkStyle 0 stroke:#ef6c00,stroke-width:1.5px
linkStyle 1 stroke:#455a64,stroke-width:2px
linkStyle 2,3 stroke:#d32f2f,stroke-width:3px
linkStyle 4 stroke:#1565c0,stroke-width:3px
linkStyle 5 stroke:#6d4c41,stroke-width:3px
linkStyle 6 stroke:#d32f2f,stroke-width:2px
linkStyle 7 stroke:#212121,stroke-width:2px
linkStyle 8 stroke:#212121,stroke-width:3px
linkStyle 9 stroke:#6a1b9a,stroke-width:2px
```mermaid