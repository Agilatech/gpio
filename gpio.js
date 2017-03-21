const GeneralPurposeIO = require('onoff').Gpio;

module.exports = class Gpio {

	constructor(gpio, direction='out', edge='none', debounce=10) {

		if ((gpio == null) || (gpio === 'undefined')) {
			throw 'Gpio exception: gpio pin not defined';
		}

		this.name = "GPIO";
		this.type = "gpio";

		this.valueNames  = ["level"];
		this.valueTypes  = ["string"];
		this.values      = ['low'];
		this.callbacks   = [];
		this.tooSoon     = false;
		this.active      = false;
		this.constructed = false;
		this.direction   = direction;
		this.edge        = edge;
		this.debouceTime = debounce;  // for mechanical switch debouncing

		try {
			this.gp = new GeneralPurposeIO(gpio, this.direction, this.edge);
		}
		catch (err) {
			throw 'Gpio exception: cannot connect to gpio ' + gpio + '. Exception ' + err;
			return(err);
		}

		// we should only watch for events for inputs
		if (this.direction == 'in') {
			this.gp.watch((this._inputEventHandler).bind(this));
		}

		this.active = true;
		this.constructed = true;

	}

	deviceName() {
		return this.name;
	}

	deviceType() {
		return this.type;
	}

	deviceVersion() {
		return "1.0.0";
	}

	deviceActive() {
		return this.active;
	}

	deviceNumValues() {
		return this.valueNames.length;
	}

	typeAtIndex(index=0) {
		if ((index < 0) || (index > this.valueTypes.length)) {
			return "none";
		}
		else {
			return this.valueTypes[index];
		}
	}

	nameAtIndex(index=0) {
		if ((index < 0) || (index > this.valueNames.length)) {
			return "none";
		}
		else {
			return this.valueNames[index];
		}
	}

	valueAtIndexSync(index=0) {
		if ((index < 0) || (index > this.values.length)) {
			return "none";
		}
		else {
			return this.values[index];
		}
	}

	valueAtIndex(index, callback) {
		var err = null;
		var val = 0;

		if ((index < 0) || (index > this.values.length)) {
			err = "Value Index Out Of Range";
		}
		else {
			val = this.values[index];
		}

		callback(err, val);
	}

	// Evaluates the command, then checks to see if it applies, then returns status.
	// Status: 1 if good and applied, 0 if good but not applied, -1 if not good
	sendCommandSync(command) {
		if ((this.direction == 'out') && (command == 'toggle')) {
			this.values[0] == 'high' ? this._sendLow() : this._sendHigh();
			return 1;
		}

		else if  ((this.direction == 'out') && ((command === 1) || (command === true) || (command == 'high'))) {
			if (this.values[0] == 'low') {
				this._sendHigh();
				return 1;
			}
			return 0;
		}

		else if ((this.direction == 'out') && ((command === 0) || (command === false) || (command == 'low'))) {
			if (this.values[0] == 'high') {
				this._sendLow();
				return 1;
			}
			return 0;
		}

		else if ((this.direction == 'in') && (command == 'trigger')) {
			var newState = this.edge == 'rising' ? 'high' : 'low';
			this._changeState(newState);
			return 1;
		}

		else {
			return -1;
		}
	}

	sendCommand(command, callback) {
		const status = this.sendCommandSync(command);

		if (status === 1) { 
			callback(null, status); 
		}
		else if (status === 0) {
			callback('redundant command', status);
		}
		else {
			callback('bad command', status);
		}

	}

	_sendHigh() {
		this.gp.writeSync(1);
		this._changeState('high');
	}

	_sendLow() {
		this.gp.writeSync(0);
		this._changeState('low');
	}

	_changeState(state) {

		if      (state === 1) { state = 'high'; }
		else if (state === 0) { state = 'low'; }

		this.values[0] = state;

		this.callbacks.forEach(function(cb) {
			cb(null, state);
		});
	}

	_inputEventHandler(err, val) {
		if (err) {
			this.callbacks.forEach(function(cb) {
				cb(err, null);
			});
		}
		else {
			if (!this.tooSoon) {

			// Attempt to eliminate spurious triggers by checking the value
			// against the given direction.
			if ( (this.edge == 'both') ||
			     (this.edge == 'falling' && val == 0) ||
			     (this.edge == 'rising'  && val == 1) ) {
					this.tooSoon = true;
					this._changeState(val);

					var self = this;
					setTimeout(function() {
						self.tooSoon = false;
					}, this.debouceTime);
					}
			}
		}
	}

	watch(callback) {
		this.callbacks.push(callback);
	}

}
