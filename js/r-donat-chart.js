function rDonatChart(config) {
    var a = {
        state: { start: 0, end: 100 }, 
        interval: null,
        init: function (config) {
            this.updateState(config);
            this.currentValue = this.state.start;
            this.render();
        },
        updateState: function (obj) {
            for (var prop in obj) { 
                this.state[prop] = obj[prop]; 
            }
        },
        render: function () {
            var container = this.state.container = $(this.state.container),
            size = this.state.size = Math.min(container.width(), container.height());
            container.html(CanvasChart({
                size: size,fontSize: this.state.fontSize || size / 4,
                fontColor:this.state.fontColor || "#000"
            }));
            var ct = this.state.ct = this.state.container.find("canvas")[0],
            ctx = this.state.ctx = ct.getContext("2d");
            this.update(this.state.value);
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
            drawValue: function () {
                if (this.state.showValue !== false) {
                    this.state.container.find("div").html(this.state.value + (this.state.unit || "%"));
                }
            },
            setText:function(text){
                a.state.container.find("div").html(text);
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
            update: function (val) {clearInterval(a.interval);
                var value = a.getValue(val),
                animatedValue = a.currentValue,
                sign = Math.sign(value - a.currentValue);
                if (sign === 0) { return; }
                a.interval = setInterval(function () {
                    if (animatedValue > value && sign > 0) {
                        clearInterval(a.interval);
                        return;
                    }
                    if (animatedValue < value && sign < 0) {
                        clearInterval(a.interval);
                        return;
                    }
                    a.currentValue = animatedValue;
                    a.redraw(animatedValue);
                    animatedValue+=sign;
                }, 20);
            },
            redraw: function (value) {
                this.state.value = value;
                this.clear();
                this.drawEmpty(); 
                this.drawFill(value); 
                this.drawValue(value);
            }
        };
        a.init(config);
        return {
            update:a.update,
            setText:a.setText
        };
    }
    function CanvasChart(props) {
        var size = props.size;
        function getStyle() {
            var str = 'color:'+props.fontColor+';';
            str += 'overflow:hidden;position:absolute;';
            str += 'width:100%;height:100%;left:0;top:0;';
            str += 'text-align:center;line-height:' + size + 'px;';
            str += 'font-size:' + props.fontSize + 'px;';
            return str;
        }
        var str = '<canvas width="' + size + '" height="' + size + '" style="' + getStyle() + '"></canvas>';
        str += '<div style="' + getStyle() + '"></div>';
        return str;
    }