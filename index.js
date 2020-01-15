/**
 * Function to register all icons as custom elements.
 */
window.registerInteractiveIcons = function () {
    customElements.define("live-icon-weather", Weather);
    customElements.define("live-icon-light", Light);
    customElements.define("live-icon-blind", Blind);
    customElements.define("live-icon-meter", Meter);
    customElements.define("live-icon-socket", Socket);
}


/**
 * Weather Icon to visualize the actual weather condition
 */
export class Weather extends HTMLElement {
    constructor() {
        super();

        this._power = 0.0;
        this._color = "#ffdb55";

        this.sun_rot = 2;
        this.last_time = performance.now();
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
            this.render(performance.now());
        }
    }

    render(time) {
        if (this.shadowRoot === null) {
            return;
        }

        var wait = time - this.last_time;
        this.last_time = time;

        this.sun_rot += wait * 0.01;

        var sunshine = "";
        for (var i = 0; i < 10; i++) {
            sunshine += `<line x1="220" x2="120" y1="0" y2="0" stroke="#ffdb55" stroke-linecap="round" stroke-width="21" transform="rotate(${(360 / 10 * i) + this.sun_rot})"/>`;
        }

        this.shadowRoot.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 550 550" xml:space="preserve">                   
            <g id="sun" transform="translate(275, 275)" >
                <circle r="80" stroke="#ffdb55" stroke-width="21" fill="none" />
                ${sunshine}
            </g>

            <g id="cloud">
                <path stroke-width="21" d="M320,128c52.562,0,95.375,42.438,96,94.813c-0.25,1.938-0.438,3.875-0.5,5.875l-0.812,23.5l22.25,7.75
                    C462.688,268.906,480,293.062,480,320c0,35.312-28.688,64-64,64H96c-35.281,0-64-28.688-64-64c0-34.938,28.188-63.438,63-64
                    c1.5,0.219,3.063,0.406,4.625,0.5l24.313,1.594l8-22.969C140.938,209.313,165.063,192,192,192c3.125,0,6.563,0.375,11.188,1.188
                    l22.406,4.031l11.156-19.844C253.875,146.938,285.75,128,320,128 M320,96c-47.938,0-89.219,26.688-111.156,65.688
                    C203.375,160.719,197.781,160,192,160c-41.938,0-77.219,27.063-90.281,64.563C99.813,224.438,97.969,224,96,224c-53,0-96,43-96,96
                    s43,96,96,96h320c53,0,96-43,96-96c0-41.938-27.062-77.25-64.562-90.313C447.5,227.75,448,225.938,448,224
                    C448,153.313,390.688,96,320,96L320,96z"/>
            </g>
        </svg>
        `;

        window.requestAnimationFrame(this.render.bind(this));
    }

    static get observedAttributes() {
        return ['power', 'color'];
    }


    attributeChangedCallback(name, oldVal, newVal) {
        this["_" + name] = newVal;
        //this.render();
    }

    safeSetAttribute(name, value) {
        if (this.getAttribute(name) !== value) this.setAttribute(name, value);
    }

    set power(power) {
        this.safeSetAttribute("power", power);
    }

    set color(color) {
        this.safeSetAttribute("color", color);
    }
}



/**
 * Light icon visualized as a light-bulb to show status and color.
 * 
 * Attributes:
 * power: Float value between 0.0 and 1.0
 * color: HTML color string for the light bulb on color
 */
export class Light extends HTMLElement {
    constructor() {
        super();

        this._power = 0.00;
        this._render_power = null;
        this._animation_speed = 0.4;
        this._animation_timestamp = null;
        this._color = "#ffdb55";
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
            this.update();
        }
    }

    update(timestamp) {
        // Only update and continue to render, when needed
        if (this._power == this._render_power) {
            return;
        }

        // calculate the speed to render the new animation
        var speed = parseFloat(this._animation_speed / (timestamp - this._animation_timestamp));
        if (!speed || speed == NaN) speed = 0;

        // set the new time point to be able to calculate the speed the next time
        this._animation_timestamp = parseInt(timestamp);

        // when the render power is close enough, just set it straight (to not un endlessly over und underadjusting)
        if (Math.abs(this._power - this._render_power) <= speed) {
            this._render_power = parseFloat(this._power);
        }
        // subtract to the right direction
        else if (Math.sign(this._power - this._render_power) == -1) {
            this._render_power = parseFloat(this._render_power) - parseFloat(speed);
        }
        // add towards the right direction
        else {
            this._render_power = parseFloat(this._render_power) + parseFloat(speed);
        }

        // rerender
        this.render();
        window.requestAnimationFrame(this.update.bind(this));
    }

    power_scale(index) {
        var lower = 0.2 * index;
        var higher = 0.2 * (index + 1);

        if (this._render_power >= lower && this._render_power <= higher) {
            return 80 - (400 * (this._render_power - lower));
        }
        else if (this._render_power <= lower) {
            return 80;
        }
        else {
            return 0;
        }
    }

    render() {
        if (this.shadowRoot === null) {
            return;
        }
        var c = this._render_power <= 0 ? "#E2ECF1" : this._color;

        this.shadowRoot.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 550 550" xml:space="preserve">                   
            <svg id="bulb" x="125" y="130">
                <path id="inner" fill="${c}" d="M 137.7 13.7 C 67.2 13.7 10 70.9 10 141.4 c 0 58.3 72.8 118.2 79.9 162.3 h 47.8 h 47.8 c 7.1 -44 79.9 -103.9 79.9 -162.3 C 265.3 70.9 208.2 13.7 137.7 13.7 z"/>
                <g id="outline">
                    <path fill="#f1f2f2" stroke="#38434a" stroke-miterlimit="10" stroke-width="19.1022" d="M 168.5 375.5 h -61.7 c -8.9 0 -16 -7.2 -16 -16 v -55.8 h 93.8 v 55.8 C 184.6 368.3 177.4 375.5 168.5 375.5 z"/>
                    <path fill="#f1f2f2" stroke="#38434a" stroke-miterlimit="10" stroke-width="19.1022" d="M 151.2 401.5 h -27.1 c -3.9 0 -7 -3.2 -7 -7 v -19 h 41.1 v 19 C 158.2 398.4 155.1 401.5 151.2 401.5 z"/>
                    <line x1="184.6" x2="90.8" y1="339.6" y2="339.6" fill="none" stroke="#38434A" stroke-miterlimit="10" stroke-width="19.1022"/>
                    <path fill="none" stroke="#38434a" stroke-miterlimit="10" stroke-width="19.1022" d="M 137.7 13.7 C 67.2 13.7 10 70.9 10 141.4 c 0 58.3 72.8 118.2 79.9 162.3 h 47.8 h 47.8 c 7.1 -44 79.9 -103.9 79.9 -162.3 C 265.3 70.9 208.2 13.7 137.7 13.7 z"/>
                </g>
                <g id="highlight">
                    <path fill="#ffdb55" stroke="#ffffff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="21" d="M 207.1 89.5 c -12.3 -16.1 -28.4 -29.1 -46.9 -37.8"/>
                    <path fill="#ffdb55" stroke="#ffffff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="21" d="M 225 121.4 c -0.8 -2.2 -1.8 -4.4 -2.7 -6.5"/>
                </g>
            </svg>

            <g id="lines">
                <line x1="80" x2="${this.power_scale(0)}" y1="0" y2="0" stroke="${c}" stroke-linecap="round" stroke-width="21" transform="translate(30 150) rotate(30)"/>
                <line x1="80" x2="${this.power_scale(1)}" y1="0" y2="0" stroke="${c}" stroke-linecap="round" stroke-width="21" transform="translate(130 55) rotate(60)"/>
                <line x1="80" x2="${this.power_scale(2)}" y1="0" y2="0" stroke="${c}" stroke-linecap="round" stroke-width="21" transform="translate(260 20) rotate(90)"/>
                <line x1="80" x2="${this.power_scale(3)}" y1="0" y2="0" stroke="${c}" stroke-linecap="round" stroke-width="21" transform="translate(400 55) rotate(120)"/>
                <line x1="80" x2="${this.power_scale(4)}" y1="0" y2="0" stroke="${c}" stroke-linecap="round" stroke-width="21" transform="translate(495 150) rotate(150)"/>
            </g>
        </svg>
        `;
    }

    static get observedAttributes() {
        return ['power', 'color'];
    }


    attributeChangedCallback(name, oldVal, newVal) {
        this["_" + name] = newVal;
        this.update();
    }

    safeSetAttribute(name, value) {
        if (this.getAttribute(name) !== value) this.setAttribute(name, value);
    }

    set power(power) {
        this.safeSetAttribute("power", power);
    }

    set color(color) {
        this.safeSetAttribute("color", color);
    }
}



/**
 * Blind icon to show the position of a blind
 * 
 * Attributes:
 * open: Float between 0.0 and 1.0 to define how much the blind is lowered
 * angle: Float between 0.0 and 1.0 to define how much the blind is tilted
 */
export class Blind extends HTMLElement {
    constructor() {
        super();

        this._open = 0.0;
        this._angle = 0.0;
        this._animation_timestamp = null;
        this._animation_speed = 0.4;
        this._animation_open = null;
        this._animation_angle = null;
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
            this.update();
        }
    }

    update(timestamp) {
        // Only update and continue to render, when needed
        if (this._open == this._animation_open && this._angle == this._animation_angle) {
            return;
        }

        // calculate the speed to render the new animation
        var speed = parseFloat(this._animation_speed / (timestamp - this._animation_timestamp));
        if (!speed || speed == NaN) speed = 0;

        // set the new time point to be able to calculate the speed the next time
        this._animation_timestamp = parseInt(timestamp);

        // when the animation open is close enough, just set it straight (to not un endlessly over und underadjusting)
        if (Math.abs(this._open - this._animation_open) <= speed) {
            this._animation_open = parseFloat(this._open);
        }
        // subtract to the right direction
        else if (Math.sign(this._open - this._animation_open) == -1) {
            this._animation_open = parseFloat(this._animation_open) - parseFloat(speed);
        }
        // add towards the right direction
        else if (Math.sign(this._open - this._animation_open) == 1) {
            this._animation_open = parseFloat(this._animation_open) + parseFloat(speed);
        }

        // when the animation angle is close enough, just set it straight (to not un endlessly over und underadjusting)
        if (Math.abs(this._angle - this._animation_angle) <= speed) {
            this._animation_angle = parseFloat(this._angle);
        }
        // subtract to the right direction
        else if (Math.sign(this._angle - this._animation_angle) == -1) {
            this._animation_angle = parseFloat(this._animation_angle) - parseFloat(speed);
        }
        // add towards the right direction
        else if (Math.sign(this._angle - this._animation_angle) == 1) {
            this._animation_angle = parseFloat(this._animation_angle) + parseFloat(speed);
        }

        // rerender
        this.render();
        window.requestAnimationFrame(this.update.bind(this));
    }

    render() {
        if (this.shadowRoot === null) {
            return;
        }

        var aw = 30 * this._animation_angle;
        var ah = 20 * this._animation_angle;
        var len = Math.round(12 * this._animation_open);

        var el = "";
        for (var i = 0; i < len; i++) {
            el += `<path fill="#38434a" stroke="#38434a" stroke-width="10" stroke-miterlimit="10" d="m ${20 + aw} ${40 * i + 80} l ${10 + aw} ${-30 + ah} h ${490 - (aw * 4)} l ${10 + aw} ${30 - ah} z"/>`;
        }

        this.shadowRoot.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 550 550" xml:space="preserve">
            ${el}
            <rect x="10" y="0" width="530" height="50" fill="#111111" />
            <line x1="450" x2="450" y1="0" y2="400" stroke="#111111" stroke-width="10" />
            <circle cx="450" cy="400" r="10" fill="#111111"/>
        </svg>
        `;
    }

    static get observedAttributes() {
        return ['open', 'angle'];
    }


    attributeChangedCallback(name, oldVal, newVal) {
        this["_" + name] = newVal;
        this.update();
    }

    safeSetAttribute(name, value) {
        if (this.getAttribute(name) !== value) this.setAttribute(name, value);
    }

    set open(val) {
        this.safeSetAttribute("open", val);
    }

    set angle(val) {
        this.safeSetAttribute("angle", val);
    }
}




/**
 * Meter icon to visualize a consumption.
 * 
 * Attributes:
 * value: The actual value of consumption to show
 * max: The maximal value reachable (red area)
 */
export class Meter extends HTMLElement {
    constructor() {
        super();

        this._value = 0;
        this._max = 9999;
        this._animation_value = 0;
        this._animation_timestamp = null;
        this._animation_speed = 4.0;
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
            this.update();
        }
    }

    update(timestamp) {
        // Only update and continue to render, when needed
        if (this._value == this._animation_value) {
            return;
        }

        // calculate the speed to render the new animation
        var speed = parseFloat(this._animation_speed / (timestamp - this._animation_timestamp));
        if (!speed || speed == NaN) speed = 0;

        // set the new time point to be able to calculate the speed the next time
        this._animation_timestamp = parseInt(timestamp);

        // when the render power is close enough, just set it straight (to not un endlessly over und underadjusting)
        if (Math.abs(this._value - this._animation_value) <= speed) {
            this._animation_value = parseFloat(this._power);
        }
        // subtract to the right direction
        else if (Math.sign(this._value - this._animation_value) == -1) {
            this._animation_value = parseFloat(this._animation_value) - parseFloat(speed);
        }
        // add towards the right direction
        else {
            this._animation_value = parseFloat(this._animation_value) + parseFloat(speed);
        }

        // rerender
        this.render();
        window.requestAnimationFrame(this.update.bind(this));
    }

    render() {
        if (this.shadowRoot === null) {
            return;
        }

        var v = '' + Math.round(this._animation_value);
        while (v.length < 4) {
            v = ' ' + v;
        }

        var r = ((this._animation_value / this._max) * 180) - 90;

        this.shadowRoot.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 64 64" xml:space="preserve">
            <g class="arrow" transform="rotate(${r} 32 32)">
                <polygon fill="#808080" points="30,32 34,32 36,28 32,14 28,28"/>
                <polygon fill="#999999" points="30.5,19.25 28,28 30,32 31,32 33,28"/>
            </g>
            <g class="scala">
                <path fill="#7CCB86" d="M16.444,16.444l-5.657-5.657l0,0C5.358,16.216,2,23.716,2,32h8   C10,25.925,12.462,20.425,16.444,16.444L16.444,16.444z"/>
                <path fill="#25A836" d="M32,10c-6.075,0-11.575,2.462-15.556,6.444l-5.657-5.657C16.216,5.358,23.716,2,32,2V10z"/>
                <path fill="#ffdb55" d="M32,2c8.284,0,15.784,3.358,21.213,8.787l-5.657,5.657C43.575,12.462,38.075,10,32,10V2z"/>
                <path fill="#ff6655" d="M53.213,10.787C58.642,16.216,62,23.716,62,32h-8c0-6.075-2.462-11.575-6.444-15.556l0,0   L53.213,10.787L53.213,10.787z"/>
            </g>
            <g class="box">
                <rect width="52" height="24" x="6" y="38" fill="#68656A" class="outter_box_border"/>
                <rect width="44" height="16" x="10" y="42" fill="#9BAAB5" class="dark_blue_outter_stripe"/>
                <rect width="41" height="16" x="10" y="42" fill="#CEE2F1" class="box_inner"/>
                <path fill="#68656A" d="M16.293,48.707L15,47.414l-1.293,1.293l-1.414-1.414l2-2c0.391-0.391,1.023-0.391,1.414,0l2,2    L16.293,48.707z"/>
                <path fill="#68656A" d="M15,55c-0.256,0-0.512-0.098-0.707-0.293l-2-2l1.414-1.414L15,52.586l1.293-1.293l1.414,1.414l-2,2    C15.512,54.902,15.256,55,15,55z"/>
            </g>
            <g class="numbers">
                <text fill="#68656A" x="20" y="55" font-family="Arial" font-size="14">${v[0]}</text>
                <text fill="#68656A" x="28" y="55" font-family="Arial" font-size="14">${v[1]}</text>
                <text fill="#68656A" x="36" y="55" font-family="Arial" font-size="14">${v[2]}</text>
                <text fill="#68656A" x="44" y="55" font-family="Arial" font-size="14">${v[3]}</text>
            </g>
        </svg>
        `;
    }

    static get observedAttributes() {
        return ['value', 'max'];
    }


    attributeChangedCallback(name, oldVal, newVal) {
        this["_" + name] = newVal;
        this.update();
    }

    safeSetAttribute(name, value) {
        if (this.getAttribute(name) !== value) this.setAttribute(name, value);
    }

    set value(val) {
        this.safeSetAttribute("value", val);
    }

    set max(val) {
        this.safeSetAttribute("max", val);
    }
}



/**
 * Socket icon to show if something is plugged in or not.
 * 
 * Attributes:
 * power: Integer either 0 or 1 to visualize the status
 */
export class Socket extends HTMLElement {
    constructor() {
        super();

        this._power = '0';
        this._last_power = '0';
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
            this.render();
        }
    }

    render() {
        if (this.shadowRoot === null) {
            return;
        }

        var animation = null;
        if (this._power !== this._last_power && this._power > 0) {
            animation = `
                <animateTransform attributeName="transform" attributeType="XML" type="translate" from="-200 -200" to="0 0" dur="0.5s" additive="sum"/>
                <animateTransform attributeName="transform" attributeType="XML" type="scale" from="1.9 1.9" to="1.0 1.0" dur="0.5s" additive="sum"/>
            `;
        }
        else if (this._power !== this._last_power && this._power <= 0) {
            animation = `
                <animateTransform attributeName="transform" attributeType="XML" type="translate" to="-200 -200" from="0 0" dur="0.5s" additive="sum"/>
                <animateTransform attributeName="transform" attributeType="XML" type="scale" to="1.9 1.9" from="1.0 1.0" dur="0.5s" additive="sum"/>
                <animate attributeName="opacity" values="${this._power <= 0 ? 1 : 0};0" dur="0.5s" fill="freeze" />
            `;
        }
        else if (this._power > 0) {
            animation = `<g></g>`
        }

        this._last_power = this._power;

        this.shadowRoot.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 512 512" xml:space="preserve">
            <g class="socket">
                <g class="box" transform="translate(3 -40) scale(0.99 1.2)">
                    <path fill="#E8EDEE" d="M0,361.931V79.448C0,54.731,19.421,35.31,44.138,35.31h423.724C492.579,35.31,512,54.731,512,79.448	v282.483c0,24.717-19.421,44.138-44.138,44.138H44.138C19.421,406.069,0,386.648,0,361.931"/>
                    <path fill="#CBD4D8" d="M57.379,70.621h397.241c12.359,0,22.069,9.71,22.069,22.069v256c0,12.359-9.71,22.069-22.069,22.069	H57.379c-12.359,0-22.069-9.71-22.069-22.069v-256C35.31,80.331,45.021,70.621,57.379,70.621"/>
                </g>
                <g class="inner" transform="translate(10 -150) scale(1.7 1.7)">
                    <path fill="#E8EDEE" d="M229.517,220.69c0-44.138-35.31-79.448-79.448-79.448s-79.448,35.31-79.448,79.448	s35.31,79.448,79.448,79.448S229.517,264.828,229.517,220.69"/>
                    <g>
                        <path fill="#38454F" d="M141.241,220.69c0-9.71-7.945-17.655-17.655-17.655s-17.655,7.945-17.655,17.655		c0,9.71,7.945,17.655,17.655,17.655S141.241,230.4,141.241,220.69"/>
                        <path fill="#38454F" d="M194.207,220.69c0-9.71-7.945-17.655-17.655-17.655c-9.71,0-17.655,7.945-17.655,17.655		c0,9.71,7.945,17.655,17.655,17.655C186.262,238.345,194.207,230.4,194.207,220.69"/>
                    </g>
                    <g>
                        <path fill="#D3AA6E" d="M150.069,141.241c-2.648,0-6.179,0-8.828,0.883v16.772c0,5.297,3.531,8.828,8.828,8.828		s8.828-3.531,8.828-8.828v-16.772C156.248,141.241,152.717,141.241,150.069,141.241"/>
                        <path fill="#D3AA6E" d="M150.069,273.655c-5.297,0-8.828,3.531-8.828,8.828v16.772c2.648,0,6.179,0.883,8.828,0.883		s6.179,0,8.828-0.883v-16.772C158.897,277.186,155.366,273.655,150.069,273.655"/>
                    </g>
                </g>
            </g>
            <g class="plug" visibility=${animation !== null ? 'visible' : 'hidden'}>
                <g class="base" transform="translate(-350 -150) scale(1.7 1.7)">
                    <path fill="#546A79" d="M441.379,220.69c0-44.138-35.31-79.448-79.448-79.448s-79.448,35.31-79.448,79.448	s35.31,79.448,79.448,79.448S441.379,264.828,441.379,220.69"/>
                    <path fill="#38454F" d="M321.324,288.662c11.476,7.062,25.6,11.476,40.607,11.476s29.131-4.414,40.607-11.476	c-7.062-45.021-7.062-90.924,0-135.945c-11.476-7.062-25.6-11.476-40.607-11.476s-29.131,4.414-40.607,11.476	C328.386,197.738,328.386,243.641,321.324,288.662"/>
                </g>
                    <g class="cable" transform="translate(-95 0) scale(1.0 1.05)">
                    <path fill="#546A79" d="M494.345,476.69c-2.648,0-4.414-0.883-6.179-2.648c-11.476-11.476-38.841-12.359-56.497-6.179	c-30.014,11.476-62.676-1.766-73.269-29.131c-3.531-7.062-5.297-15.007-5.297-23.835V247.172c0-5.297,3.531-8.828,8.828-8.828	s8.828,3.531,8.828,8.828v167.724c0,6.179,0.883,12.359,3.531,17.655c7.945,18.538,30.014,27.366,51.2,19.421	c22.952-8.828,58.262-7.062,75.034,9.71c3.531,3.531,3.531,8.828,0,12.359C498.759,475.807,496.993,476.69,494.345,476.69"/>
                </g>
                ${animation}
            </g>
        </svg>
        `;
    }

    static get observedAttributes() {
        return ['power'];
    }


    attributeChangedCallback(name, oldVal, newVal) {
        this["_" + name] = newVal;
        this.render();
    }

    safeSetAttribute(name, value) {
        if (this.getAttribute(name) !== value) this.setAttribute(name, value);
    }

    set power(val) {
        this.safeSetAttribute("power", val);
    }

}
