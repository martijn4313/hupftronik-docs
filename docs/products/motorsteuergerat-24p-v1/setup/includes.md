# Shared 24P V1 setup notes
Product details:
Product range: Hüpftronik
Type: Engine control
Name: Motorsteurgerät 24P
Version: V1
Status: Alpha testing

## Engine position
1 VR Sensor input. Differential signal input. Using MAX9924.

All spare inputs can be used for 0-5V triggers. Spare 1 and 2 can also be used for analog signals and are present on the 24P connector. Spare 3, 4 and 5 are assecable by pin header on the PCB. See hardware modifcation section how to add a connector for these. Keep in mind these inputs are not enhanced ESD protected. (only by the resistor divider itself).

## Fuel injection
Notes about injector wiring, injector type, basic setup expectations.

## Ignition
Notes about coil/igniter choices and ignition strategy.