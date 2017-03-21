##Node class module for GPIO input/output driver

#####This class module should work on any Linux platform, and has been thoroughly tested on BBB

###Install

```
npm install @agilatech/gpio
```
OR
```
git clone https://github.com/Agilatech/gpio.git
```

###Usage
#####Load the module and create an instance
```
const driver = require('@agilatech/gpio');

// creation of an instance will throw an exception if unable to connect to given gpio
try {
    // input constructor
    const gpin = new driver(gpio, direction, edge, debounce);

    // output constructor only needs the gpio parameter
    const gpout = new driver(gpio) 
}
catch {
    console.err("Failed to create gpio instance");
}
```
Constructor parameters:
1. gpio : The GPIO pin number or other hardware definition -- mandatory parameter, throws exception if not defined
2. direction : 'in' for input, 'out' for output -- defaults to 'out'
3. edge : the edge on which to trigger an input event -- 'none', 'rising', 'falling', or 'both' -- defaults to 'none'
4. debounce : the number of milliseconds during which to reject another input -- used to debounce a mechanical switch -- defaults to 10


#####Get basic device info
```
const name = gpio.deviceName();  // returns string with name of device
const type = gpio.deviceType();  // returns string with type of device
const version = gpio.deviceVersion(); // returns this software version
const active = gpio.deviceActive(); // true if active, false if inactive
const numVals =  gpio.deviceNumValues(); // returns the number of paramters sensed
```
####Send command to device
This device accepts commands in order to switch the level state of the output or trigger an input. Use the sendCommand function in either its synchronous or asynchronous form, with the single required parameter describing the desired action.
The command parameter may take one of four forms:
1. high : sets the gpio output to high (also thought of as 1 or true) -- for output only
2. low : sets the gpio output to low (also thought of as 0 or false) -- for output only
3. toggle : flips the gpio output to the opposite of the current condition -- for output only
4. trigger : triggers an input event -- used only for input

Two functions accept commands, one syncronous and the other asynchronous
1. sendCommandSync(command) : synchronously send the string command
2. sendCommand(command, callback) : asynchronously send the command string, with the callback fucntion receiving err, status upon completion. 

```
gpout.sendCommandSync('high');

// or asynchronously sendCommand(cmd, callback)
gpin.sendCommand('trigger', function(err, status) {
    if (err) {
            console.err(`Error! ${err}`);
        }
        else {
            console.log("triggered input");
        }
    });
}

The return value is a numerical result, 1=successfull command, 0=N/A command, -1=bad command. The asynchronous version returns this result in the status parameter of the callback.
```

####Get parameter info and values
Since there is only one single I/O, the index value will always be 0. The index parameter is retained in this driver to maintain consistency with other related drivers.
```
// given a parameter index, these return parameter info
const paramName0 = gpio.nameAtIndex(0);
const paramType0 = gpio.typeAtIndex(0);
const paramVal0  = gpio.valueAtIndexSync(0);
```
####Asynchronous value collection is also available
```
//valueAtIndex(index, callback)
gpio.valueAtIndex(0, function(err, val) {
    if (err) {
        console.error(err);
    }
    else {
        console.log(`Asynchronous call return: ${val}`);
    }
});
```
####Watch for value changes
```
// watch(callback)
gpio.watch(function(err, val) {
	if (!err) {
		console.log("Gpio value is now : " + val);
	}
});
```

###Operation Notes
This class module is a general purpose driver for a single input or output.  It is intended to be a generic driver to simply operate a single GPIO.  It makes no assumptions about what real-world function the GPIO may be doing, whether controlling a small LED or operating coolant valves on a nuclear power plant.  It is intended for use with the Agilatech VersaLink IIoT system, but has a simple and generic enough API to be used by most anything.


###Copyright
Copyright © 2017 Agilatech. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

