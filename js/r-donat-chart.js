//r-donat-chart.js////
function rDonatChart(config) {
    var a = {
        state: { start: 0, end: 100 }, 
        interval: null,
        init: function (config) {
            this.updateState(config);
            this.state.value = this.getValue(this.state.value);
            this.setSpeed();
            this.currentValue = this.state.start;
            this.render();
        },
        setSpeed:function(){
            var range = this.state.end - this.state.start;
            this.speed = Math.pow(range / 1600, -1);
        },
        updateState: function (obj) {
            for (var prop in obj) { 
                this.state[prop] = obj[prop]; 
            }
        },
        render: function () {
            var container = this.state.container = $(this.state.container),
            size = this.state.size = Math.min(container.width(), container.height());
            container.html(CanvasChart({size: size}));
            var ct = this.state.ct = this.state.container.find("canvas")[0],
            ctx = this.state.ctx = ct.getContext("2d");
            this.update({value:this.state.value,text:this.state.text});
        },
        drawEmpty: function () {
            var size = this.state.size,
            thickness = this.state.thickness || size * 0.2,
            ctx = this.state.ctx;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - thickness / 2, 0, 360 * Math.PI / 180);
            ctx.lineWidth = thickness;
            ctx.strokeStyle = this.state.emptyColor || "#eee";
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
        },
        getAngle: function (value) {
            if (value === this.state.start) { value = this.state.end; }
            else if (value === this.state.end) { value = this.state.start; }
            var angle = 360 * (value - this.state.start) / (this.state.end - this.state.start); 
            return 360 - angle;
        },
        drawFill: function () {
            var value = this.state.value,
            ctx = this.state.ctx,
            size = this.state.size,
            thickness = this.state.thickness || size * 0.2;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - thickness / 2,
                this.getAngle(value) * Math.PI / 180,0);
                ctx.lineWidth = thickness;ctx.strokeStyle = this.state.fillColor || "#000";
                ctx.stroke();
                ctx.closePath();
            },
            getTemplate:function(){
                return a.state.container.find("div").html();
            },
            clear:function(){
                this.state.ctx.clearRect(0, 0, this.state.size, this.state.size);
            },
            getValue:function(val){
                var value = (val === undefined) ? this.state.start : val;
                if (value < this.state.start) { value = this.state.start; }
                else if (value > this.state.end) { value = this.state.end; }
                return value;
            },
            setText: function (text) {
                text = this.state.text === undefined ? text : this.state.text;
                if (text === undefined) { return;}
                this.state.container.find("div").html(text);
            },
            updateOther:function(obj){
                a.state.start = obj.start === undefined ? a.state.start : obj.start;
                a.state.end = obj.end === undefined ? a.state.end : obj.end;
                a.state.unit = obj.unit || a.state.unit;
                a.state.fillColor = obj.fillColor || a.state.fillColor;
                a.state.emptyColor = obj.emptyColor || a.state.emptyColor;
                a.state.thickness = obj.thickness || a.state.thickness;
                a.setSpeed();
            },
            update: function (obj) {
                a.updateOther(obj);
                clearInterval(a.interval);
                obj.value = obj.value === undefined ? a.state.value : obj.value;
                var value = a.getValue(obj.value),
                animatedValue = a.currentValue,
                sign = Math.sign(value - a.currentValue);
                a.interval = setInterval(function () {
                    if (animatedValue > value && sign > 0) {
                        if (obj.text !== undefined) { a.setText(obj.text); }
                        clearInterval(a.interval);
                        return;
                    }
                    if (animatedValue < value && sign < 0) {
                        if (obj.text!==undefined) { a.setText(obj.text); }
                        clearInterval(a.interval);
                        return;
                    }
                    a.currentValue = animatedValue;
                    a.state.value = animatedValue;
                    a.redraw();
                    if (sign === 0) {
                        if (obj.text!==undefined) { a.setText(obj.text); }
                        clearInterval(a.interval);
                        return;
                    }
                    animatedValue += sign;
                }, a.speed);
            },
            redraw: function (value) {
                this.clear();
                this.drawEmpty(); 
                this.drawFill(value); 
                this.setText(this.state.value + (this.state.unit || ""));  
            }
        };
        a.init(config);
        return {
            update:a.update,
        };
    }
    function CanvasChart(props) {
        var size = props.size;
        function getStyle() {
            var str = '';
            str += 'overflow:hidden;position:absolute;width:100%;height:100%;left:0;top:0;';
            str += 'text-align:center;line-height:' + size + 'px;';
            return str;
        }
        var str = '<canvas width="' + size + '" height="' + size + '" style="' + getStyle() + '"></canvas>';
        str += '<div style="' + getStyle() + '"></div>';
        return str;
    }